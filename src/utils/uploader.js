import multer from "multer";
import path from "path";
import fs from "fs";

// Carpeta donde se guardarán las imágenes
const uploadDir = path.join(process.cwd(), "public", "image");

// Asegurarse de que la carpeta exista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        const newFileName = Date.now() + "-" + file.originalname;
        callback(null, newFileName);
    }
});

// Middleware de subida
const uploader = multer({ storage });

export default uploader;
