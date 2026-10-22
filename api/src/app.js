import express from "express";
import cors from "cors";
import { configurarPassport } from "./config/passport.js";
import { authRouter } from "./routes/auth.routes.js";
import { manejarError, rutaNoEncontrada } from "./middlewares/error.middleware.js";

const API_VERSION = "1.0.0";
const app = express();
const passport = configurarPassport();

// 1. CORS Middleware (primera capa según arquitectura Express + JWT + MongoDB)
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// 2. Header global de versionado SemVer
app.use((req, res, next) => {
  res.set("X-API-Version", API_VERSION);
  next();
});

// 3. Diagnóstico de salud del servicio
app.get("/health", (req, res) => {
  res.status(200).json({
    estado: "ok",
    version: API_VERSION,
    servicio: "api-jwt-passport-gremio",
  });
});

// 4. Rutas de Autenticación y Autorización JWT
app.use("/api/v1", authRouter);

// 5. Captura de 404 y errores
app.use(rutaNoEncontrada);
app.use(manejarError);

export default app;
