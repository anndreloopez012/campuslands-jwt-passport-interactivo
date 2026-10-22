# Campuslands · Autenticación con JWT mediante Passport.JS (Cyber Auth · Gremio de Cazadores)

[![Node.js](https://img.shields.io/badge/Node.js-20%2B%20ESM-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-RFC%207519%20HS256-f43f5e)](https://jwt.io/)
[![Passport.js](https://img.shields.io/badge/Passport.js-Local%20%2B%20JWT-34e27a)](https://www.passportjs.org/)
[![Interactive Web](https://img.shields.io/badge/GitHub%20Pages-Guía%20Interactiva-8b5cf6)](https://anndreloopez012.github.io/campuslands-jwt-passport-interactivo/)

Laboratorio visual, dinámico y guiado de **30 minutos** para dominar la **Autenticación y Autorización con JSON Web Tokens (RFC 7519) mediante Passport.JS, Express, CORS y MongoDB**, combinando toda la teoría oficial de clase con la construcción de una API REST segura y 10 pruebas automatizadas.

**Autor:** Andre Lopez · Basado en el material de **Eduin Salas Viloria** (*Campuslands*)

**Guía publicada:** [anndreloopez012.github.io/campuslands-jwt-passport-interactivo](https://anndreloopez012.github.io/campuslands-jwt-passport-interactivo/)

---

## 🛡️ ¿Qué incluye este repositorio?

- **Plataforma web interactiva responsive** con estética Gamer / Cyber Auth, cronómetro de 30 minutos y modo enfoque para proyector en clase.
- **Explicación completa de la presentación oficial**:
  - Introducción a **JWT (`RFC 7519`)**, firmas con secreto (`HMAC`) y claves pública/privada (`RSA` / `ECDSA`).
  - **Seguridad en los JWT**: Diferencia entre tokens firmados (integridad de las afirmaciones) y tokens cifrados (confidencialidad).
  - **¿Por qué y cuándo utilizar JWT?**: Las 6 ventajas clave, Autorización, **Single Sign-On (SSO)** e Intercambio seguro de información.
  - **Anatomía de un JWT**: Cabecera (`Header`), Carga útil (`Payload`: reclamaciones registradas, públicas y privadas) y Firma (`Signature`).
  - **Debugger interactivo estilo `jwt.io` en vivo**: Modifica el Header, Payload o Secret en tiempo real y simula ataques de manipulación de firma.
  - **Passport.JS a fondo**: Diseño modular no intrusivo, +500 estrategias (`Local`, `OAuth/OpenID`, `Tokens JWT`), persistencia/serialización y hooks.
  - **Diagrama de flujo interactivo Client ↔ API Server** (`POST /users/authenticate` y `GET /user/list` con `Bearer Token`).
  - **Explorador de Arquitectura en Capas**: `HTTP Request → CORS Middleware → JWT Authentication Middleware → Authorization Middleware → Controllers → DB Driver → MongoDB → HTTP Response`.
- **API Backend funcional en `api/`** con flujo aditivo (sin reescrituras de archivos) y **10 pruebas automatizadas** nativas con `node:test`.

---

## ⏱️ Ruta de Aprendizaje de 30 Minutos

| Checkpoint | Tema | Resultado |
|---|---|---|
| **00** | Fundamentos JWT (RFC 7519) | Comprender qué es un JWT, tokens firmados vs cifrados, y casos de uso (SSO y Autorización) |
| **01** | Anatomía & Debugger `jwt.io` | Inspeccionar Header, Payload y Signature en Base64Url y crear DTOs + Validadores |
| **02** | Passport.JS & Arquitectura | Dominar estrategias de Passport, diagrama de secuencia y servicio de firma JWT |
| **03** | Estrategias en Código | Configurar `LocalStrategy` y `JwtStrategy` (`ExtractJwt.fromAuthHeaderAsBearerToken()`) |
| **04** | Security Middlewares | Implementar `autenticarLocal`, `autenticarJWT` (`401`) y `autorizarAdmin` (`403`) |
| **05** | Controladores, Rutas y CORS | Ensamblar `POST /users/authenticate`, `GET /user/list` y `POST /boveda/recompensa` |
| **06** | Boss Fight: Simulador & Tests | Ejecutar la suite de 10 pruebas (`npm test`) y simular ataques de token adulterado |

---

## 📂 Estructura del Repositorio

```text
campuslands-jwt-passport-interactivo/
├── index.html                      # Plataforma web interactiva (Teoría + Debugger JWT.io + Simulador)
├── styles.css                      # Estilos con estética Cyber Auth y modo enfoque
├── app.js                          # Lógica del debugger JWT.io, simulador Bearer, cronómetro y XP
├── README.md                       # Documentación principal del laboratorio
├── LICENSE                         # Licencia MIT
├── .gitignore                      # Exclusiones de Git
├── .nojekyll                       # Despliegue directo en GitHub Pages
├── AGENTS.md                       # Reglas multi-agente (Graphify/Obsidian)
├── CLAUDE.md                       # Instrucciones para Claude Code
└── api/
    ├── package.json                # Dependencias y scripts de Node.js (ESM)
    ├── README.md                   # Documentación técnica de la API y comandos cURL
    ├── src/
    │   ├── app.js                  # Express + CORS Middleware + Passport + SemVer
    │   ├── server.js               # Conexión a MongoDB (con respaldo en memoria) y puerto 3000
    │   ├── config/
    │   │   └── passport.js         # Estrategias LocalStrategy y JwtStrategy (HS256)
    │   ├── controllers/
    │   │   └── auth.controller.js  # Controladores de autenticación, listado y bóveda
    │   ├── dtos/
    │   │   └── cazador.dto.js      # Sanitización de login y ocultamiento de password
    │   ├── middlewares/
    │   │   ├── auth.middleware.js  # Middlewares autenticarLocal, autenticarJWT y autorizarAdmin
    │   │   └── error.middleware.js # Manejador centralizado de errores y 404
    │   ├── models/
    │   │   └── cazador.model.js    # Modelo Mongoose y semilla oficial del Gremio
    │   ├── routes/
    │   │   └── auth.routes.js      # Definición de endpoints protegidos
    │   ├── services/
    │   │   └── cazador.service.js  # Emisión de JWT (HS256, exp: 2h) y consultas
    │   └── validators/
    │       └── auth.validator.js   # Validaciones con express-validator
    └── test/
        └── api.test.js             # 10 pruebas automatizadas con node:test
```

---

## 🌐 Ejecutar la Guía Web Interactiva

```bash
python3 -m http.server 4173
```

Abre en tu navegador `http://127.0.0.1:4173`.

---

## ⚙️ Ejecutar la API Backend y las 10 Pruebas

```bash
cd api
npm install
npm test
npm run check
npm start
```

---

## 📋 Endpoints de la API

| Método | Endpoint | Capa de Seguridad | Código Éxito / Error |
|---|---|---|---|
| `GET` | `/health` | Pública (`CORS` + `X-API-Version`) | `200 OK` |
| `POST` | `/api/v1/users/authenticate` | `validarLogin` + `autenticarLocal` (Passport Local) | `200 OK` / `400` / `401` |
| `GET` | `/api/v1/user/list` | `autenticarJWT` (Passport JWT Bearer Token) | `200 OK` / `401 Unauthorized` |
| `POST` | `/api/v1/boveda/recompensa` | `autenticarJWT` + `autorizarAdmin` (`admin: true`) | `201 Created` / `401` / `403 Forbidden` |
