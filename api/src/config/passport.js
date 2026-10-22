import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { cazadorService, JWT_SECRET } from "../services/cazador.service.js";
import { PerfilCazadorDTO } from "../dtos/cazador.dto.js";

export { JWT_SECRET };

export function configurarPassport() {
  // 1. Estrategia Local: verifica usuario y contraseña al hacer login
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "username", passwordField: "password", session: false },
      async (username, password, done) => {
        try {
          const cazador = await cazadorService.buscarPorUsername(username);
          if (!cazador || cazador.password !== password) {
            return done(null, false, { message: "Credenciales inválidas: usuario o contraseña incorrectos" });
          }
          return done(null, cazador);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // 2. Estrategia JWT: extrae el Bearer Token, verifica firma HMAC y expiración
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
        algorithms: ["HS256"],
      },
      async (jwtPayload, done) => {
        try {
          const cazador = await cazadorService.buscarPorSub(jwtPayload.sub);
          if (!cazador) {
            return done(null, false, { message: "El titular del token ya no existe en el gremio" });
          }
          // Adjuntamos el perfil limpio y los claims verificados del token
          return done(null, {
            ...new PerfilCazadorDTO(cazador),
            claims: jwtPayload,
          });
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  return passport;
}
