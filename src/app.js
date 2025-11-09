import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import productRouter from "./routes/products.router.js";
import viewsRouter from "./routes/views.router.js";
import ProductManager from "./productManager.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const productManager = new ProductManager(path.join(__dirname, "products.json"));

// Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Pasar io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use("/", viewsRouter);
app.use("/api/products", productRouter);

// Página pública
app.get("/home", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { products });
});

io.on("connection", async (socket) => {
  console.log("🟢 Cliente conectado a WebSocket");

  try {
    const products = await productManager.getProducts(); // ✅ aquí obtienes los productos
    socket.emit("updateProducts", products);             // ahora sí existe
  } catch (err) {
    console.error("Error al obtener productos:", err);
  }
});


server.listen(8081, () => {
  console.log("🚀 Servidor escuchando en http://localhost:8081");
});
