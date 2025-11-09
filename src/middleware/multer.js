import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../public/image");
    fs.mkdirSync(uploadPath, { recursive: true }); // crea la carpeta si no existe
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${name}${ext}`);
  }
});



const uploader = multer({ storage });

export default uploader;
