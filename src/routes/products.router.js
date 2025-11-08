import express from "express";
import ProductManager from "../productManager.js";
import uploader from "../utils/uploader.js";

const productRouter = express.Router();
const productManager = new ProductManager("./src/products.json");

productRouter.post("/", uploader.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "Falta adjuntar la imagen al formulario" });

    const { title, price, stock, description, status, thumbnails } = req.body;
    const thumbnail = "./public/image/" + req.file.filename;

    // Solo estos campos son obligatorios
    const requiredFields = [title, price, stock, thumbnail];
    const missingFields = requiredFields.filter(
      (field) => field === undefined || field === null || field === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${missingFields.join(", ")}`,
      });
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ message: "El precio debe ser mayor a 0" });
    }

    if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      return res.status(400).json({ message: "El stock debe ser mayor o igual a 0" });
    }

    const newProduct = {
      title,
      price: Number(price),
      stock: Number(stock),
      thumbnail,
      description: description || "",
      status: status !== undefined ? Boolean(status) : true,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    };

    const products = await productManager.addProduct(newProduct);
    res.status(201).json({ message: "Producto agregado", products });
    res.redirect("/")
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default productRouter;
