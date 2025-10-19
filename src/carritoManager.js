import fs from "fs/promises";
import crypto from "crypto";

class CarritoManager {
    constructor(pathFile, productsPathFile) {
        this.pathFile = pathFile;
        this.productsPathFile = productsPathFile;
    }
    
    generateNewId() {
        return crypto.randomUUID();
    }
    
    async addCart() {
        try {
            let carts = [];
            
            try {
                const data = await fs.readFile(this.pathFile, "utf-8");
                carts = JSON.parse(data);
            } catch {
                carts = [];
            }
            
            const newCart = { id: this.generateNewId(), products: [] };
            carts.push(newCart);
            
            await fs.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");
            return newCart;
        } catch (error) {
            throw new Error("Error al añadir el nuevo carrito: " + error.message);
        }
    }
    
    async getCartById(cid) {
        try {
            const cartsData = await fs.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(cartsData);
            
            const productsData = await fs.readFile(this.productsPathFile, "utf-8");
            const products = JSON.parse(productsData);
            
            
            const cart = carts.find((cart) => cart.id === cid);
            if (!cart) throw new Error("No existe el carrito con ese ID");
            
            const detailedProducts = cart.products.map((item) => {
                const product = products.find((product) => product.id === item.productId);
                return product
                ? { ...product, quantity: item.quantity }
                : { productId: item.productId, quantity: item.quantity, error: "Producto no encontrado" };
            });
            
            return { id: cart.id, products: detailedProducts };
        } catch (error) {
            throw new Error("Error al traer el carrito: " + error.message);
        }
    }
    
    async addProductsToCarts(pid, cid, quantity = 1) {
        try {
            const cartsData = await fs.readFile(this.pathFile, "utf-8");
            const carts = JSON.parse(cartsData);
            
            const productsData = await fs.readFile(this.productsPathFile, "utf-8");
            const products = JSON.parse(productsData);
            
            const cartIndex = carts.findIndex((cart) => cart.id === cid);
            if (cartIndex === -1) {
                throw new Error("No existe el carrito con ese ID");
            }
            
            const product = products.find((product) => product.id === pid);
            if (!product) {
                throw new Error("Producto no encontrado");
            }
            
            const cart = carts[cartIndex];
            const existingProduct = cart.products.find((product) => product.productId === pid);

            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ productId: pid, quantity });
            }
            
            await fs.writeFile(this.pathFile, JSON.stringify(carts, null, 2), "utf-8");
            
            
            const detailedProducts = cart.products.map((item) => {
                const prod = products.find((product) => product.id === item.productId);
                return prod
                ? { ...prod, quantity: item.quantity }
                : { productId: item.productId, quantity: item.quantity, error: "Producto no encontrado" };
            });
            
            return { id: cart.id, products: detailedProducts };
        } catch (error) {
            throw new Error("Error al agregar producto al carrito: " + error.message);
        }
    }
}

export default CarritoManager;