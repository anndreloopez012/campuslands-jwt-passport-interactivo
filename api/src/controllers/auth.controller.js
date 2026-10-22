import { PerfilCazadorDTO, CrearRecompensaDTO } from "../dtos/cazador.dto.js";
import { cazadorService } from "../services/cazador.service.js";

// POST /api/v1/users/authenticate -> Verifica usuario válido y genera el JWT
export async function autenticarUsuario(req, res, next) {
  try {
    const token = cazadorService.firmarTokenJWT(req.user);
    const perfil = new PerfilCazadorDTO(req.user);

    res.status(200).json({
      token,
      tipo: "Bearer",
      expiraEn: "2h",
      cazador: perfil,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/user/list -> Ruta protegida que consume la reclamación del token como identidad
export async function listarUsuarios(req, res, next) {
  try {
    const cazadores = await cazadorService.listarPerfiles();
    res.status(200).json({
      identidadToken: {
        sub: req.user.claims?.sub,
        username: req.user.username,
        name: req.user.name,
        admin: req.user.admin,
      },
      data: cazadores,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/boveda/recompensa -> Requiere JWT válido + Authorization Middleware (admin: true)
export async function registrarRecompensaBoveda(req, res, next) {
  try {
    const dto = new CrearRecompensaDTO(req.body);
    const recompensa = await cazadorService.crearRecompensa(dto, req.user.username);
    res.status(201).json({ data: recompensa });
  } catch (error) {
    next(error);
  }
}
