import express from "express";
import ProductManager from "./productManager.js";
import CarritoManager from "./carritoManager.js";

const app = express();
app.use(express.json());

const productManager = new ProductManager("./src/products.json");
const cartManager = new CarritoManager("./src/carts.json", "./src/product.json");

app.get("/", (req, res) => {
    res.json({ status: "success", message: "¡Hola Mundo!" });
});

app.get("/api/products", async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.status(200).json({ message: "Lista de productos", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/products/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productManager.getProduct(pid);
        
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        
        res.status(200).json({ message: "Producto encontrado", product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/products", async (req, res) => {
    try {

        const newProduct = req.body;
        const requiredFiels = ["title", "description", "price", "status", "stock"];
        const missingFields = requiredFiels.filter(
            field => newProduct[field] === undefined || newProduct[field] === null
        );

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Faltan los siguientes campos obligatorios: ${missingFields.join}`
            });
        }

        if (isNaN(Number(newProduct.price)) || Number(newProduct.status) < 0) {
            return res.status(400).json({
                message:"El precio debe ser mayor a 0"
            });
        }

        if (!Number.isInteger(Number(newProduct.stock)) || Number(newProduct.stock)<0) {
            return res.status(400).json({
                message:"El stock debe ser mayor a 0"
            });
        }

        if (newProduct.status === undefined) {
            newProduct.status = true;
        } else if (typeof newProduct.status !== "boolean") {
            return res.status(400).json({
                message:"El status debe ser verdadero o falso"
            });
        }

        if (newProduct.thumbnails === undefined) {
            newProduct.thumbnails = [];
        } else if (!Array.isArray(newProduct.thumbnails)) {
            return res.status(400).json({
                message:"Debe ser un array de string"
            });
        }else {
            const allString = newProduct.thumbnails.every(img => typeof img === "string");
            if (!allString) {
                return res.status(400).json({
                    message:"Debe ser un array de string"
                })
            }
        }
        const products = await productManager.addProduct(newProduct);
        res.status(201).json({ message: "Producto agregado", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/api/products/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const updates = req.body;

        const products = await productManager.setProductById(pid, updates);
        res.status(200).json({ message: "Producto actualizado", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/api/products/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const products = await productManager.deleteProductById(pid);
        res.status(200).json({ message: "Producto eliminado", products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/carts", async (req, res) => {
    try {
        const cart = await cartManager.addCart();
        res.status(201).json({ message: "Carrito creado correctamente", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/api/carts/:cid", async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartManager.getCartById(cid);
        
        if (!cart) {
            return res.status(404).json({ message: "Carrito no encontrado" });
        }
        
        res.status(200).json({ message: "Carrito encontrado", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/api/carts/:cid/products/:pid", async (req, res) => {
    
    try {
        const { pid, cid } = req.params;
        const quantity = parseInt(req.body?.quantity ?? 1);
            
        if (isNaN(quantity) || quantity <= 0) {
            return res
            .status(400)
            .json({ message: "La cantidad debe ser un número mayor que 0" });
        }
        
        const product = await productManager.getProduct(pid);
        if (!product) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        const updatedCart = await cartManager.addProductsToCarts(pid, cid, quantity);

        res.status(200).json({
            message: "Producto agregado al carrito",
            cart: updatedCart,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(8081, () => {
    console.log("Servidor iniciado correctamente en el puerto 8081 🚀");
});