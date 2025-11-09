import express from "express";
import path from "path";
import ProductManager from "../productManager.js";
import multer from "multer";

const productRouter = express.Router();
const productManager = new ProductManager(path.join("src", "products.json"));

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join("public", "image")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});
const uploader = multer({ storage });


productRouter.post("/", uploader.single("file"), async (req, res) => {
  try {
    const { title, price, stock, description, status } = req.body;
    if (!title || !price || !stock || !req.file) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const newProduct = {
      title,
      price: Number(price),
      stock: Number(stock),
      thumbnail: "/image/" + req.file.filename,
      description: description || "",
      status: status !== undefined ? Boolean(status) : true,
      thumbnails: [],
    };

    await productManager.addProduct(newProduct);
    const products = await productManager.getProducts();

    // Emitir evento para actualizar en tiempo real
    req.io.emit("updateProducts", products);

    res.status(201).json({ message: "Producto agregado", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Editar producto
productRouter.put("/:pid", uploader.single("file"), async (req, res) => {
  try {
    const pid = req.params.pid;
    const updates = { ...req.body };

    if (req.file) {
      updates.thumbnail = "/image/" + req.file.filename;
    }

    const updated = await productManager.setProductById(pid, updates);
    if (!updated) return res.status(404).json({ message: "Producto no encontrado" });

    const products = await productManager.getProducts();
    req.io.emit("updateProducts", products);

    res.json({ message: "Producto actualizado", updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


productRouter.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productManager.getProduct(pid);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });


    if (product.thumbnail) {
      const imagePath = path.join(__dirname, "../public/image", path.basename(product.thumbnail));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    const updatedProducts = await productManager.deleteProdcutById(pid);
    res.status(200).json({ message: "Producto eliminado", products: updatedProducts });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: error.message });
  }
});

export default productRouter;

