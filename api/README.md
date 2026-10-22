# API REST de Autenticación con JWT mediante Passport.js · Gremio de Cazadores · 30 Minutos

Este proyecto acompaña la plataforma interactiva de refuerzo para Campuslands sobre **Autenticación y Autorización con JWT (RFC 7519) mediante Passport.js en Express y MongoDB**.

---

## 🎯 Objetivo de Aprendizaje
Comprender y construir la arquitectura completa de seguridad de una aplicación Express con JWT y Passport.js:

```text
HTTP Request → CORS Middleware → JWT Authentication Middleware → Authorization Middleware → Controllers → DB Driver → MongoDB → HTTP Response
```

---

## 📦 Estructura del Proyecto API

```text
api/
├── package.json                    # Dependencias y scripts (Express 5, Passport, JWT, Mongoose)
├── README.md                       # Guía técnica de la API y pruebas cURL
├── src/
│   ├── app.js                      # Configuración de Express, CORS, Passport y SemVer
│   ├── server.js                   # Conexión a MongoDB (con respaldo en memoria) y puerto 3000
│   ├── config/
│   │   └── passport.js             # Estrategias LocalStrategy y JwtStrategy (HS256)
│   ├── controllers/
│   │   └── auth.controller.js      # Controladores de login, listado protegido y bóveda admin
│   ├── dtos/
│   │   └── cazador.dto.js          # Sanitización de credenciales y ocultamiento de password
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Middlewares autenticarLocal, autenticarJWT y autorizarAdmin
│   │   └── error.middleware.js     # Manejador centralizado de errores y 404
│   ├── models/
│   │   └── cazador.model.js        # Esquema Mongoose y semilla oficial del Gremio
│   ├── routes/
│   │   └── auth.routes.js          # Endpoints RESTful protegidos
│   ├── services/
│   │   └── cazador.service.js      # Firma criptográfica JWT y consultas de datos
│   └── validators/
│       └── auth.validator.js       # Validaciones declarativas con express-validator
└── test/
    └── api.test.js                 # 10 pruebas automatizadas nativas con node:test
```

---

## 🚀 Cómo Ejecutar la API

```bash
cd api
npm install
npm start
```

Para ejecutar las 10 pruebas automatizadas:
```bash
npm test
npm run check
```

---

## 🛡️ Usuarios de Prueba (Semilla del Gremio)

| Username | Password | Nombre | Rango | Claim `admin` |
|---|---|---|---|---|
| `satinder` | `12345` | Satinder Cyborg | `S` | `true` (Gran Maestro) |
| `kael` | `54321` | Kael Vanguard | `A` | `false` (Cazador) |
| `nyx` | `99999` | Nyx Shadowrunner | `A` | `false` (Cazadora) |

---

## 🧪 Pruebas Manuales con cURL

### 1. Autenticar usuario y obtener Token JWT (`POST /api/v1/users/authenticate`)
```bash
curl -i -X POST http://localhost:3000/api/v1/users/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"satinder","password":"12345"}'
```

### 2. Consultar lista protegida enviando el Bearer Token (`GET /api/v1/user/list`)
```bash
TOKEN="PEGA_AQUI_TU_TOKEN_JWT"
curl -i http://localhost:3000/api/v1/user/list \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Probar acceso a la Bóveda Maestra (Requiere `admin: true`)
```bash
curl -i -X POST http://localhost:3000/api/v1/boveda/recompensa \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"mision":"Dragón de Neón","cristales":500}'
```
