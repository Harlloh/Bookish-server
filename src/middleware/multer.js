import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName)
    }
})
const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF allowed.'), false);
    }
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
export default upload