# Protocolo Multi-Agente - Campuslands JWT & Passport.js Interactivo

Este repositorio forma parte de los proyectos de formación de Campuslands y utiliza el protocolo de sincronización continua con Obsidian Vault y Graphify para colaboración entre agentes (Antigravity, Codex y Claude Code).

---

## 1. Arquitectura y Tecnologías
- **Entorno:** Node.js 20+ con ES Modules (`"type": "module"` en `package.json`).
- **Framework & Librerías:**
  - Express 5.x para enrutamiento y middleware.
  - `jsonwebtoken` (RFC 7519) para firma (`HMAC-SHA256`), decodificación y verificación de expiración (`exp`) y claims personalizados.
  - `passport`, `passport-local` y `passport-jwt` para estrategias modulares de autenticación sin estado (`session: false`).
  - `cors` para el middleware de control de acceso HTTP según el diagrama de arquitectura oficial.
  - Mongoose 8.x para modelado de datos en MongoDB con soporte híbrido en memoria para pruebas rápidas.
  - `express-validator` 7.x para validación declarativa de credenciales y payloads.
  - Node.js test runner nativo (`node:test` y `node:assert/strict`) con 10 pruebas automatizadas.
- **Frontend Educativo:**
  - Guía web estática interactiva (`index.html`, `styles.css`, `app.js`) compatible con GitHub Pages.
  - Debugger interactivo estilo `jwt.io` en vivo (Header, Payload, Signature `HMACSHA256`), simulador de peticiones HTTP con Bearer Token, cronómetro de 30 minutos y control de checkpoints XP.
- **Estructura:**
  - `api/src/app.js`: Configuración de Express, CORS, Passport, SemVer y rutas.
  - `api/src/server.js`: Conexión a MongoDB y escucha en puerto 3000.
  - `api/src/config/passport.js`: Estrategias `LocalStrategy` y `JwtStrategy`.
  - `api/src/middlewares/auth.middleware.js`: Middlewares `autenticarJWT` y `autorizarRol`.
  - `api/src/dtos/cazador.dto.js`: DTOs de autenticación y perfil seguro (sin exponer contraseñas).
  - `api/src/models/cazador.model.js`: Modelo Mongoose de Cazadores del Gremio.
  - `api/src/services/cazador.service.js`: Operaciones de búsqueda, autenticación y generación de JWT.
  - `api/src/controllers/auth.controller.js`: Coordinación de login (`POST /users/authenticate`), listado protegido (`GET /user/list`) y bóveda admin (`POST /boveda/recompensa`).
  - `api/src/routes/auth.routes.js`: Declaración de endpoints RESTful protegidos.

---

## 2. Protocolo de Memoria Continua (Obsidian + Graphify)
Al realizar cambios en este repositorio, los agentes deben cumplir estrictamente:

1. **Inspección Previa:**
   - Ejecutar `git status --short` antes de modificar archivos.
2. **Actualización de Grafo y Memoria:**
   - Actualizar el grafo: `graphify update .` o `graphify .`.
   - Exportar a Obsidian:
     ```bash
     graphify export obsidian --dir "$HOME/Documents/OBSIDIAN/PROGRAMACION/Graphify/campuslands-jwt-passport-interactivo"
     ```
   - Sincronizar memoria: `memoria refresh`.
   - Registrar validaciones o decisiones:
     ```bash
     memoria registrar campuslands-jwt-passport-interactivo --tipo [aprendizaje|decision|cambio|validacion] --titulo "..." --texto "..."
     ```
3. **Flujo de Ramas Git:**
   - Trabajo estructurado en ramas `dev` y `main`.
   - La rama `main` conserva la versión estable sincronizada y lista para despliegue en GitHub Pages.
