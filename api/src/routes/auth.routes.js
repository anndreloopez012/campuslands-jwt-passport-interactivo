import { Router } from "express";
import {
  autenticarUsuario,
  listarUsuarios,
  registrarRecompensaBoveda,
} from "../controllers/auth.controller.js";
import {
  autenticarLocal,
  autenticarJWT,
  autorizarAdmin,
} from "../middlewares/auth.middleware.js";
import { validarLogin, validarRecompensa } from "../validators/auth.validator.js";

export const authRouter = Router();

// 1. Autenticación: genera y firma el token JWT
authRouter.post("/users/authenticate", validarLogin, autenticarLocal, autenticarUsuario);

// 2. Ruta protegida por JWT Authentication Middleware
authRouter.get("/user/list", autenticarJWT, listarUsuarios);

// 3. Ruta protegida por JWT Authentication + Authorization Middleware (solo admin)
authRouter.post(
  "/boveda/recompensa",
  autenticarJWT,
  autorizarAdmin,
  validarRecompensa,
  registrarRecompensaBoveda
);
