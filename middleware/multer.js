import multer from "multer";

const storage = multer.memoryStorage(); // memory me rakhega
const upload = multer({ storage });

export default upload;
