import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import app from "../src/app.js";
import { CredencialesDTO, PerfilCazadorDTO } from "../src/dtos/cazador.dto.js";
import { JWT_SECRET } from "../src/config/passport.js";

async function withServer(application, run) {
  const server = application.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("01. GET /health responde 200, incluye X-API-Version SemVer y cabeceras CORS", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("x-api-version"), "1.0.0");
    assert.equal(response.headers.get("access-control-allow-origin"), "*");
    assert.deepEqual(body, {
      estado: "ok",
      version: "1.0.0",
      servicio: "api-jwt-passport-gremio",
    });
  });
});

test("02. CredencialesDTO y PerfilCazadorDTO sanitizan la entrada y ocultan el password", () => {
  const cred = new CredencialesDTO({
    username: "  Satinder  ",
    password: "12345",
    hackAdmin: true,
  });

  assert.deepEqual({ ...cred }, {
    username: "satinder",
    password: "12345",
  });
  assert.equal("hackAdmin" in cred, false);

  const perfil = new PerfilCazadorDTO({
    id: "1234567890",
    username: "satinder",
    name: "Satinder Hunter",
    rango: "S",
    admin: true,
    password: "secret_password_hash",
  });

  assert.equal("password" in perfil, false);
  assert.equal(perfil.name, "Satinder Hunter");
  assert.equal(perfil.admin, true);
});

test("03. POST /api/v1/users/authenticate autentica usuario válido y devuelve un JWT firmado", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "satinder",
        password: "12345",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(typeof body.token === "string");
    assert.equal(body.token.split(".").length, 3);
    assert.equal(body.cazador.username, "satinder");
    assert.equal("password" in body.cazador, false);
  });
});

test("04. POST /api/v1/users/authenticate rechaza credenciales inválidas con 401 Unauthorized", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "satinder",
        password: "clave_erronea",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.match(body.error, /credenciales inválidas/i);
  });
});

test("05. POST /api/v1/users/authenticate rechaza campos vacíos o muy cortos con 400 Bad Request", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "a",
        password: "12",
      }),
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.ok(Array.isArray(body.errores));
    assert.ok(body.errores.length >= 2);
  });
});

test("06. Anatomía del JWT cumple RFC 7519: Header (HS256, JWT), Payload (sub, name, admin, exp) y Firma", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "satinder", password: "12345" }),
    });
    const { token } = await response.json();

    const decodedComplete = jwt.decode(token, { complete: true });
    assert.equal(decodedComplete.header.alg, "HS256");
    assert.equal(decodedComplete.header.typ, "JWT");
    assert.equal(decodedComplete.payload.sub, "1234567890");
    assert.equal(decodedComplete.payload.name, "Satinder Cyborg");
    assert.equal(decodedComplete.payload.admin, true);
    assert.ok(decodedComplete.payload.exp > decodedComplete.payload.iat);

    const verified = jwt.verify(token, JWT_SECRET);
    assert.equal(verified.username, "satinder");
  });
});

test("07. GET /api/v1/user/list sin header Authorization Bearer devuelve 401 Unauthorized", async () => {
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/user/list`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.match(body.error, /token/i);
  });
});

test("08. GET /api/v1/user/list rechaza un JWT con firma manipulada devolviendo 401 Unauthorized", async () => {
  const tokenFalso = jwt.sign(
    { sub: "999", username: "hacker", admin: true },
    "clave_secreta_falsa_pirata",
    { algorithm: "HS256", expiresIn: "1h" }
  );

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/user/list`, {
      headers: { Authorization: `Bearer ${tokenFalso}` },
    });
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.match(body.error, /inválido|expirado|no autorizado/i);
  });
});

test("09. GET /api/v1/user/list con Bearer JWT válido retorna la lista de cazadores e identidad del token", async () => {
  await withServer(app, async (baseUrl) => {
    const loginRes = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "satinder", password: "12345" }),
    });
    const { token } = await loginRes.json();

    const listRes = await fetch(`${baseUrl}/api/v1/user/list`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await listRes.json();

    assert.equal(listRes.status, 200);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 3);
    assert.equal(body.identidadToken.username, "satinder");
  });
});

test("10. POST /api/v1/boveda/recompensa aplica Authorization Middleware (403 a cazador normal, 201 a admin)", async () => {
  await withServer(app, async (baseUrl) => {
    // 1. Login como cazador normal (admin: false)
    const loginHunter = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "kael", password: "54321" }),
    });
    const { token: hunterToken } = await loginHunter.json();

    const forbiddenRes = await fetch(`${baseUrl}/api/v1/boveda/recompensa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${hunterToken}`,
      },
      body: JSON.stringify({ mision: "Dragón de Neón", cristales: 500 }),
    });
    assert.equal(forbiddenRes.status, 403);

    // 2. Login como Gran Maestro Admin (admin: true)
    const loginAdmin = await fetch(`${baseUrl}/api/v1/users/authenticate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "satinder", password: "12345" }),
    });
    const { token: adminToken } = await loginAdmin.json();

    const allowedRes = await fetch(`${baseUrl}/api/v1/boveda/recompensa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ mision: "Dragón de Neón", cristales: 500 }),
    });
    const allowedBody = await allowedRes.json();

    assert.equal(allowedRes.status, 201);
    assert.equal(allowedBody.data.mision, "Dragón de Neón");
    assert.equal(allowedBody.data.autorizadoPor, "satinder");
  });
});
