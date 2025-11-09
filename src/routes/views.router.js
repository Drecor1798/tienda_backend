import { Router } from "express"; // 👈 CORRECTO
import ProductManager from "../productManager.js";
import path from "path";

const viewsRouter = Router(); // 👈 CORRECTO
const productManager = new ProductManager(path.join(process.cwd(), "src/products.json"));

// Dashboard
viewsRouter.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", { products });
});

// Vista pública
viewsRouter.get("/home", async (req, res) => {
  const products = await productManager.getProducts();
  res.render("home", { products });
});

export default viewsRouter;
