import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Para poder usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    cb(null, path.join(__dirname, "/../../public/image"));
  },
  filename: (req, file, cb) => {
    // Genera un nombre único: timestamp + nombre original
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});

// Filtro opcional para permitir solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpg, png, gif)"));
  }
};

// Exportamos el uploader listo para usar
const uploader = multer({ storage, fileFilter });

export default uploader;

