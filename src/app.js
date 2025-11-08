import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";

import ProductManager from "./productManager.js";
import viewsRouter from "./routes/views.router.js";
import productRouter from "./routes/products.router.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== Middlewares ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); 
app.use(express.static("public"));         
app.use("/image", express.static("public/image"));


app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views")); 

app.use("/", viewsRouter);
app.use("/api/products", productRouter);

const productManager = new ProductManager(path.join(__dirname, "products.json"));

app.get("/api/products", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).json({ message: "Lista de productos", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.listen(8081, () => {
    console.log("Servidor iniciado correctamente en el puerto 8081 🚀");
});