import jwt from "jsonwebtoken";
import { CAZADORES_SEMILLA } from "../models/cazador.model.js";
import { PerfilCazadorDTO } from "../dtos/cazador.dto.js";

export const JWT_SECRET = process.env.JWT_SECRET || "campuslands_secret_key_256_bits";
export const JWT_EXPIRES_IN = "2h";

const recompensasMemoria = [
  {
    id: "bov-001",
    mision: "Núcleo Criptográfico RFC 7519",
    cristales: 1200,
    autorizadoPor: "satinder",
    createdAt: "2026-10-21T18:00:00.000Z",
  },
];

export const cazadorService = {
  async buscarPorUsername(username) {
    const limpio = String(username ?? "").trim().toLowerCase();
    return CAZADORES_SEMILLA.find((c) => c.username === limpio) || null;
  },

  async buscarPorSub(sub) {
    return CAZADORES_SEMILLA.find((c) => c.sub === String(sub)) || null;
  },

  async listarPerfiles() {
    return CAZADORES_SEMILLA.map((c) => new PerfilCazadorDTO(c));
  },

  firmarTokenJWT(cazador) {
    // Carga útil (Payload) con reclamaciones registradas (sub), públicas y privadas (admin, rango)
    const payload = {
      sub: cazador.sub,
      username: cazador.username,
      name: cazador.name,
      rango: cazador.rango,
      admin: Boolean(cazador.admin),
    };

    // Cabecera (Header) firmada con algoritmo simétrico HMAC-SHA256 (HS256) y caducidad incorporada
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  async crearRecompensa(datos, adminUsername) {
    const nueva = {
      id: `bov-${Date.now()}`,
      mision: datos.mision,
      cristales: datos.cristales,
      autorizadoPor: adminUsername,
      createdAt: new Date().toISOString(),
    };
    recompensasMemoria.unshift(nueva);
    return nueva;
  },
};
