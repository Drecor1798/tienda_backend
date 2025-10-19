import fs from "fs/promises"
import crypto from "crypto"
import { trace } from "console";
import { title } from "process";

class ProductManager{

    constructor(pathFile){
        this.pathFile = pathFile;
    }

    generateNewId(){
        return crypto.randomUUID();
    }

    async addProduct(newProduct){
        try {
            const fileDate =  await fs.readFile(this.pathFile, "utf-8");
            const products = JSON.parse(fileDate);

            const newId = this.generateNewId()
            //Creamos el nuevo producto y lo pusheamos el array de productos
            const product = { id: newId, ...newProduct }
            products.push(product);

            //guardamos los productos en el json
            await fs.writeFile( this.pathFile, JSON.stringify(products, null, 2), "utf-8" );
            return products;
        } catch (error) {
            throw new Error("Error al añadir el nuevo producto: " + error.message)
        }
    }

    async getProducts(){
        try {
            const fileDate =  await fs.readFile(this.pathFile, "utf-8");
            const products = JSON.parse(fileDate);

            return products;
        } catch (error) {
            throw new Error("Error al traer los producto: " + error.message)
        }
    }

    async getProduct(pid){
        try {
            const fileDate =  await fs.readFile(this.pathFile, "utf-8");
            const products = JSON.parse(fileDate);

            const filterProducts = products.filter((product) => product.id === pid);
            if (!filterProducts) {
                throw new Error("No existe el producto")
            }

            return filterProducts
        } catch (error) {
            throw new Error("Error al traer los producto: " + error.message)
        }
    }

    async setProductById(pid, updates){
        try {
            const fileDate =  await fs.readFile(this.pathFile, "utf-8");
            const products = JSON.parse(fileDate);

            const indexProduct = products.findIndex((product) => product.id === pid );
            if(indexProduct === -1) throw new Error("Prodcuto no encontrado");
            products[indexProduct] = { ...products[indexProduct], ...updates };

            await fs.writeFile(this.pathFile, JSON.stringify(products, null, 2), "utf-8");

            return products;

        } catch (error) {
            throw new Error("Error al actualizar el producto producto: " + error.message)
        }
    }

    async deleteProdcutById(pid){
        try {
            const fileDate =  await fs.readFile(this.pathFile, "utf-8");
            const products = JSON.parse(fileDate);

            const filterProducts = products.filter((product) => product.id !== pid);
            await fs.writeFile(this.pathFile, JSON.stringify(filterProducts, null, 2), "utf-8");
            return filterProducts;
        } catch (error) {
            throw new Error("Error al borrar un producto: " + error.message)
        }
    }
}

export default ProductManager