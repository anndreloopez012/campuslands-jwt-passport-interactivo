import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/api_jwt_gremio";

try {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 1800 });
  console.log("🛡️ Conectado a MongoDB:", MONGO_URI);
} catch {
  console.log("⚡ MongoDB local no detectado: operando con semilla en memoria del Gremio de Cazadores.");
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor Cyber Auth (JWT + Passport.js) listo en http://localhost:${PORT}`);
});
