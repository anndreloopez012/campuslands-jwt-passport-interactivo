const TOTAL_SECONDS = 30 * 60;
const STORAGE_KEY = "campuslands-jwt-passport-progress";
const TOKEN_KEY = "campuslands-jwt-passport-active-token";

const timerDisplay = document.querySelector("#timerDisplay");
const timerToggle = document.querySelector("#timerToggle");
const timerReset = document.querySelector("#timerReset");
const timerContainer = document.querySelector(".timer");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const progressMessage = document.querySelector("#progressMessage");
const finishCard = document.querySelector("#finishCard");
const toast = document.querySelector("#toast");

let secondsRemaining = TOTAL_SECONDS;
let timerId = null;
let toastId = null;
let completedSteps = readStorage(STORAGE_KEY, []);

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Funciona incluso si localStorage está restringido.
  }
}

function showToast(message) {
  window.clearTimeout(toastId);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastId = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(secondsRemaining);
  document.title = timerId
    ? `${formatTime(secondsRemaining)} · Cyber Auth JWT Lab`
    : "Cyber Auth Lab · JWT & Passport.JS (Gremio de Cazadores)";
}

function pauseTimer() {
  window.clearInterval(timerId);
  timerId = null;
  timerContainer.classList.remove("is-running");
  timerToggle.title = "Continuar cronómetro";
  timerToggle.setAttribute("aria-label", "Continuar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z" /></svg>';
  renderTimer();
}

function startTimer() {
  if (timerId || secondsRemaining <= 0) return;
  timerContainer.classList.add("is-running");
  timerToggle.title = "Pausar cronómetro";
  timerToggle.setAttribute("aria-label", "Pausar cronómetro");
  timerToggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>';
  timerId = window.setInterval(() => {
    secondsRemaining -= 1;
    renderTimer();
    if (secondsRemaining === 0) {
      pauseTimer();
      showToast("¡Tiempo cumplido! Ejecuta la Boss Fight de pruebas.");
    }
  }, 1000);
}

timerToggle.addEventListener("click", () => (timerId ? pauseTimer() : startTimer()));
timerReset.addEventListener("click", () => {
  pauseTimer();
  secondsRemaining = TOTAL_SECONDS;
  renderTimer();
  showToast("Cronómetro reiniciado a 30:00");
});

document.querySelectorAll("[data-start-lab]").forEach((button) => {
  button.addEventListener("click", () => {
    startTimer();
    document.querySelector("#anatomia").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#focusToggle").addEventListener("click", (event) => {
  const active = document.body.classList.toggle("focus-mode");
  event.currentTarget.querySelector("span").textContent = active ? "Mostrar ruta" : "Modo enfoque";
  event.currentTarget.setAttribute("aria-pressed", String(active));
});

const TOTAL_CHECKPOINTS = 7;

function updateProgress() {
  completedSteps = [...new Set(completedSteps)].sort((a, b) => a - b);
  const percentage = Math.round((completedSteps.length / TOTAL_CHECKPOINTS) * 100);
  progressBar.style.width = `${percentage}%`;
  progressLabel.textContent = `${percentage}%`;
  progressMessage.textContent =
    completedSteps.length === TOTAL_CHECKPOINTS
      ? "¡Misión completada! Dominas JWT, Passport.js y seguridad en Express."
      : `${completedSteps.length} de ${TOTAL_CHECKPOINTS} misiones completadas.`;

  document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
    const step = Number(checkpoint.dataset.complete);
    const complete = completedSteps.includes(step);
    checkpoint.classList.toggle("is-complete", complete);
    checkpoint.setAttribute("aria-pressed", String(complete));
  });

  document.querySelectorAll("[data-section]").forEach((navItem) => {
    const section = document.querySelector(`#${navItem.dataset.section}`);
    if (section) {
      const step = Number(section.dataset.step);
      navItem.classList.toggle("is-complete", completedSteps.includes(step));
    }
  });

  finishCard.classList.toggle("is-unlocked", completedSteps.length === TOTAL_CHECKPOINTS);
  writeStorage(STORAGE_KEY, completedSteps);
}

document.querySelectorAll("[data-complete]").forEach((checkpoint) => {
  checkpoint.addEventListener("click", () => {
    const step = Number(checkpoint.dataset.complete);
    if (completedSteps.includes(step)) {
      completedSteps = completedSteps.filter((savedStep) => savedStep !== step);
    } else {
      completedSteps.push(step);
      showToast(step === 6 ? "¡Escudo JWT completado al 100%!" : `Checkpoint ${String(step).padStart(2, "0")} completado (+100 XP)`);
    }
    updateProgress();
  });
});

document.querySelector("[data-reset-progress]").addEventListener("click", () => {
  completedSteps = [];
  updateProgress();
  document.querySelector("#inicio").scrollIntoView({ behavior: "smooth" });
  showToast("Progreso reiniciado");
});

const navItems = [...document.querySelectorAll("[data-section]")];
const lessonSections = [...document.querySelectorAll(".lesson")];
let navigationLocked = false;
let scrollFrame = null;

function setActiveNavigation(sectionId) {
  navItems.forEach((item) => {
    const active = item.dataset.section === sectionId;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
}

function updateActiveNavigation() {
  if (navigationLocked) return;
  const marker = window.scrollY + window.innerHeight * 0.34;
  let activeSection = lessonSections[0];
  lessonSections.forEach((section) => {
    if (section.offsetTop <= marker) activeSection = section;
  });
  if (activeSection) setActiveNavigation(activeSection.id);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navigationLocked = true;
    setActiveNavigation(item.dataset.section);
    window.setTimeout(() => {
      navigationLocked = false;
      updateActiveNavigation();
    }, 850);
  });
});

window.addEventListener("scroll", () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateActiveNavigation();
    scrollFrame = null;
  });
}, { passive: true });

document.querySelectorAll("[data-copy-code]").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = [...button.closest("[data-code-panel]").querySelectorAll(".code-line > span")]
      .map((line) => {
        const cleanLine = line.cloneNode(true);
        cleanLine.querySelectorAll("small").forEach((comment) => comment.remove());
        return cleanLine.textContent.trimEnd();
      })
      .join("\n");
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "¡Copiado!";
      showToast("Código copiado al portapapeles");
      window.setTimeout(() => {
        button.textContent = "Copiar código";
      }, 1400);
    } catch {
      showToast("Selecciona el código y usa Ctrl/Cmd + C");
    }
  });
});

// ============================================================================
// DEBUGGER INTERACTIVO ESTILO JWT.IO (SLIDES 7, 8 Y 9)
// ============================================================================
function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function computeSignature(headerB64, payloadB64, secret) {
  const input = `${headerB64}.${payloadB64}.${secret}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const raw = `${(h1 >>> 0).toString(16).padStart(8, "0")}${(h2 >>> 0).toString(16).padStart(8, "0")}${secret.length}campusjwt`;
  return base64UrlEncode(raw);
}

const jwtHeaderInput = document.querySelector("#jwtHeaderInput");
const jwtPayloadInput = document.querySelector("#jwtPayloadInput");
const jwtSecretInput = document.querySelector("#jwtSecretInput");
const jwtEncodedDisplay = document.querySelector("#jwtEncodedDisplay");
const jwtVerifyBadge = document.querySelector("#jwtVerifyBadge");
let simulatedTamper = false;

function renderJwtDebugger() {
  try {
    const headerObj = JSON.parse(jwtHeaderInput.value);
    const payloadObj = JSON.parse(jwtPayloadInput.value);
    const secret = jwtSecretInput.value || "secret";

    const headerB64 = base64UrlEncode(JSON.stringify(headerObj));
    const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));
    const validSig = computeSignature(headerB64, payloadB64, secret);
    const displayedSig = simulatedTamper ? computeSignature(headerB64, payloadB64, "hacker_wrong_secret") : validSig;

    jwtEncodedDisplay.innerHTML =
      `<span class="jwt-part--header">${headerB64}</span>` +
      `<span class="jwt-dot">.</span>` +
      `<span class="jwt-part--payload">${payloadB64}</span>` +
      `<span class="jwt-dot">.</span>` +
      `<span class="jwt-part--signature">${displayedSig}</span>`;

    if (simulatedTamper) {
      jwtVerifyBadge.classList.add("is-invalid");
      jwtVerifyBadge.innerHTML = `<span>✕ Invalid Signature — El Payload fue alterado sin el Secret real</span><small>401 REJECTED</small>`;
    } else {
      jwtVerifyBadge.classList.remove("is-invalid");
      jwtVerifyBadge.innerHTML = `<span>✔ Signature Verified — Emisor e integridad confirmados</span><small>${headerObj.alg || "HS256"}</small>`;
    }
  } catch {
    jwtVerifyBadge.classList.add("is-invalid");
    jwtVerifyBadge.innerHTML = `<span>✕ JSON Inválido en Header o Payload</span><small>SYNTAX ERROR</small>`;
  }
}

[jwtHeaderInput, jwtPayloadInput, jwtSecretInput].forEach((input) => {
  input.addEventListener("input", () => {
    simulatedTamper = false;
    renderJwtDebugger();
  });
});

const jwtDebuggerPresets = {
  johndoe: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { sub: "1234567890", name: "John Doe", admin: true, iat: 1516239022 },
    secret: "your-256-bit-secret",
    tamper: false,
  },
  satinder: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { sub: "1234567890", username: "satinder", name: "Satinder Cyborg", rango: "S", admin: true },
    secret: "campuslands_secret_key_256_bits",
    tamper: false,
  },
  kael: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { sub: "9876543210", username: "kael", name: "Kael Vanguard", rango: "A", admin: false },
    secret: "campuslands_secret_key_256_bits",
    tamper: false,
  },
  tamper: {
    header: { alg: "HS256", typ: "JWT" },
    payload: { sub: "9876543210", username: "kael", name: "Kael (HACKED ADMIN)", rango: "S", admin: true },
    secret: "campuslands_secret_key_256_bits",
    tamper: true,
  },
};

document.querySelectorAll("[data-jwt-preset]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const preset = jwtDebuggerPresets[btn.dataset.jwtPreset];
    jwtHeaderInput.value = JSON.stringify(preset.header, null, 2);
    jwtPayloadInput.value = JSON.stringify(preset.payload, null, 2);
    jwtSecretInput.value = preset.secret;
    simulatedTamper = preset.tamper;
    renderJwtDebugger();
  });
});

renderJwtDebugger();

// ============================================================================
// ARQUITECTURA INTERACTIVA EXPRESS + JWT + MONGODB (SLIDE 14)
// ============================================================================
const archDescriptions = {
  cors: `<strong>1. CORS Middleware (Express.js):</strong> Primera barrera que recibe el <code>HTTP Request</code>. Configura los encabezados <code>Access-Control-Allow-Origin</code> para permitir que clientes web o móviles autorizados se comuniquen con la API.`,
  jwtAuth: `<strong>2. JWT Authentication Middleware (Security):</strong> Usa <code>passport-jwt</code> para extraer el <code>Bearer Token</code> del encabezado HTTP, verificar la firma criptográfica <code>HMAC-SHA256</code> y comprobar que no haya expirado (<code>exp</code>). Si falla, responde <code>401 Unauthorized</code>.`,
  authz: `<strong>3. Authorization Middleware (Security):</strong> Una vez verificada la identidad del token, evalúa las reclamaciones privadas (ej. <code>admin: true</code>). Si el cazador no tiene permisos para ese recurso, responde <code>403 Forbidden</code>.`,
  controllers: `<strong>4. Controllers:</strong> Reciben la petición ya autenticada y autorizada (con <code>req.user</code> poblado por Passport), coordinan la lógica de negocio con los DTOs y preparan el <code>HTTP Response</code>.`,
  driver: `<strong>5. DB Driver (Servicios + Mongoose):</strong> Encapsula las consultas y transformaciones de datos hacia la base de datos usando esquemas tipados.`,
  mongodb: `<strong>6. MongoDB:</strong> Almacena de forma persistente los documentos de usuarios/cazadores y registros de la aplicación.`,
};

document.querySelectorAll("[data-arch-layer]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-arch-layer]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    document.querySelector("#archDetailBox").innerHTML = archDescriptions[btn.dataset.archLayer];
  });
});

// ============================================================================
// SIMULADOR EN VIVO DE LA API JWT + PASSPORT (SECCIÓN 06)
// ============================================================================
const CAZADORES_DB = [
  { id: "1234567890", sub: "1234567890", username: "satinder", password: "12345", name: "Satinder Cyborg", rango: "S", admin: true },
  { id: "9876543210", sub: "9876543210", username: "kael", password: "54321", name: "Kael Vanguard", rango: "A", admin: false },
  { id: "5556667770", sub: "5556667770", username: "nyx", password: "99999", name: "Nyx Shadowrunner", rango: "A", admin: false },
];

const SIM_SECRET = "campuslands_secret_key_256_bits";
const methodSelect = document.querySelector("#methodSelect");
const routeSelect = document.querySelector("#routeSelect");
const authHeaderInput = document.querySelector("#authHeaderInput");
const requestBody = document.querySelector("#requestBody");
const sendRequest = document.querySelector("#sendRequest");
const responseOutput = document.querySelector("#responseOutput");
const responseStatus = document.querySelector("#responseStatus");
const cookieOutput = document.querySelector("#cookieOutput");

function createSimToken(cazador) {
  const headerB64 = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadB64 = base64UrlEncode(
    JSON.stringify({
      sub: cazador.sub,
      username: cazador.username,
      name: cazador.name,
      rango: cazador.rango,
      admin: cazador.admin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7200,
    })
  );
  const sig = computeSignature(headerB64, payloadB64, SIM_SECRET);
  return `${headerB64}.${payloadB64}.${sig}`;
}

function verifySimToken(tokenStr) {
  const parts = String(tokenStr || "").split(".");
  if (parts.length !== 3) return { valid: false, reason: "Formato JWT inválido (debe tener 3 partes: Header.Payload.Signature)" };
  const [headerB64, payloadB64, sig] = parts;
  const expectedSig = computeSignature(headerB64, payloadB64, SIM_SECRET);
  if (sig !== expectedSig) {
    return { valid: false, reason: "Firma HMAC-SHA256 inválida: el token fue alterado o firmado con otro secreto" };
  }
  try {
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    return { valid: true, payload: JSON.parse(json) };
  } catch {
    return { valid: false, reason: "Payload Base64Url corrupto" };
  }
}

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.dataset.preset;
    if (key === "loginAdmin") {
      methodSelect.value = "POST";
      routeSelect.value = "/api/v1/users/authenticate";
      requestBody.disabled = false;
      requestBody.value = JSON.stringify({ username: "satinder", password: "12345" }, null, 2);
    } else if (key === "loginHunter") {
      methodSelect.value = "POST";
      routeSelect.value = "/api/v1/users/authenticate";
      requestBody.disabled = false;
      requestBody.value = JSON.stringify({ username: "kael", password: "54321" }, null, 2);
    } else if (key === "getList") {
      methodSelect.value = "GET";
      routeSelect.value = "/api/v1/user/list";
      requestBody.disabled = true;
    } else if (key === "postVault") {
      methodSelect.value = "POST";
      routeSelect.value = "/api/v1/boveda/recompensa";
      requestBody.disabled = false;
      requestBody.value = JSON.stringify({ mision: "Dragón de Neón", cristales: 500 }, null, 2);
    } else if (key === "tamperToken") {
      methodSelect.value = "GET";
      routeSelect.value = "/api/v1/user/list";
      requestBody.disabled = true;
      const fakeHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const fakePayload = base64UrlEncode(JSON.stringify({ sub: "999", username: "hacker", admin: true }));
      authHeaderInput.value = `Bearer ${fakeHeader}.${fakePayload}.FIRMA_ADULTERADA_PIRATA`;
      showToast("Token adulterado cargado en Authorization Header");
    }
  });
});

function simulateApiCall() {
  const route = routeSelect.value;
  const method = methodSelect.value;

  if (route === "/health") {
    return {
      status: 200,
      body: { estado: "ok", version: "1.0.0", servicio: "api-jwt-passport-gremio" },
    };
  }

  if (route === "/api/v1/users/authenticate" && method === "POST") {
    let data;
    try {
      data = JSON.parse(requestBody.value);
    } catch {
      return { status: 400, body: { error: "El body no contiene JSON válido" } };
    }
    const username = String(data.username ?? "").trim().toLowerCase();
    const password = String(data.password ?? "");
    if (username.length < 3 || password.length < 4) {
      return {
        status: 400,
        body: {
          errores: [
            { path: "username", msg: "El username debe tener entre 3 y 30 caracteres" },
            { path: "password", msg: "El password debe tener al menos 4 caracteres" },
          ],
        },
      };
    }
    const found = CAZADORES_DB.find((c) => c.username === username && c.password === password);
    if (!found) {
      return {
        status: 401,
        body: { error: "Credenciales inválidas: usuario o contraseña incorrectos" },
      };
    }
    const token = createSimToken(found);
    authHeaderInput.value = `Bearer ${token}`;
    writeStorage(TOKEN_KEY, token);
    cookieOutput.textContent = `${found.username} (admin: ${found.admin}) · Bearer ${token.slice(0, 24)}...`;

    return {
      status: 200,
      body: {
        token,
        tipo: "Bearer",
        expiraEn: "2h",
        cazador: {
          id: found.id,
          username: found.username,
          name: found.name,
          rango: found.rango,
          admin: found.admin,
        },
      },
    };
  }

  // Rutas protegidas por Passport-JWT
  const authHeader = authHeaderInput.value.trim();
  if (!authHeader.startsWith("Bearer ")) {
    return {
      status: 401,
      body: { error: "Acceso denegado: debes enviar el header Authorization: Bearer [JWT Token]" },
    };
  }

  const rawToken = authHeader.slice(7).trim();
  const check = verifySimToken(rawToken);
  if (!check.valid) {
    return {
      status: 401,
      body: {
        error: "Token JWT inválido, firma alterada o expirado",
        detalle: check.reason,
      },
    };
  }

  if (route === "/api/v1/user/list") {
    return {
      status: 200,
      body: {
        identidadToken: {
          sub: check.payload.sub,
          username: check.payload.username,
          name: check.payload.name,
          admin: check.payload.admin,
        },
        data: CAZADORES_DB.map(({ password, sub, ...clean }) => clean),
      },
    };
  }

  if (route === "/api/v1/boveda/recompensa") {
    if (!check.payload.admin) {
      return {
        status: 403,
        body: {
          error: "Prohibido (403): tu token es válido, pero necesitas reclamación admin: true para abrir la Bóveda Maestra",
          rangoActual: check.payload.rango,
        },
      };
    }
    let bodyData = {};
    try {
      bodyData = JSON.parse(requestBody.value);
    } catch {
      return { status: 400, body: { error: "JSON inválido" } };
    }
    return {
      status: 201,
      body: {
        data: {
          id: `bov-${Date.now()}`,
          mision: bodyData.mision || "Misión Clasificada",
          cristales: Number(bodyData.cristales || 500),
          autorizadoPor: check.payload.username,
          createdAt: new Date().toISOString(),
        },
      },
    };
  }

  return { status: 404, body: { error: "Ruta no encontrada" } };
}

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
}

function highlightJson(data) {
  const safeJson = escapeHtml(JSON.stringify(data, null, 2));
  return safeJson.replace(
    /(&quot;.*?&quot;)(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?/g,
    (match, string, colon) => {
      if (string) return colon ? `<span class="console-key">${string}</span>${colon}` : `<span class="console-string">${string}</span>`;
      return `<span class="console-number">${match}</span>`;
    }
  );
}

sendRequest.addEventListener("click", () => {
  responseStatus.textContent = "VERIFICANDO...";
  responseStatus.className = "response-status";
  responseOutput.innerHTML = '<span class="console-muted">// Flujo: Request → CORS → Passport Middleware → Controller → Response...</span>';
  sendRequest.disabled = true;

  window.setTimeout(() => {
    const response = simulateApiCall();
    responseStatus.textContent = `${response.status} ${response.status < 400 ? "OK" : "REJECTED"}`;
    responseStatus.classList.add(response.status < 400 ? "is-success" : "is-error");
    responseOutput.innerHTML = `<span class="console-muted">X-API-Version: 1.0.0\nAccess-Control-Allow-Origin: *\nContent-Type: application/json\n\n</span>${highlightJson(response.body)}`;
    sendRequest.disabled = false;
  }, 260);
});

document.querySelectorAll("[data-quiz-answer]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const ok = btn.dataset.quizAnswer === "reject";
    const feedback = document.querySelector("#quizFeedback");
    feedback.textContent = ok
      ? "✔ ¡Exacto! Como la firma se calcula con HMACSHA256(base64Url(header) + '.' + base64Url(payload), secret), cualquier cambio en el payload invalida la firma inmediatamente."
      : "✕ Incorrecto: Base64Url no es cifrado, pero la firma digital HMAC-SHA256 detecta cualquier alteración del payload si no se conoce el secret.";
    feedback.style.color = ok ? "#10b981" : "#f43f5e";
  });
});

updateProgress();
renderTimer();
updateActiveNavigation();
