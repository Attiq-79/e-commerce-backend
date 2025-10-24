import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import upload from "../middleware/multer.js"; // ✅ Multer import

const productRouter = express.Router();

// ✅ Allow multiple images upload (max 10 images)
productRouter.post("/products", upload.array("images", 10), createProduct);
productRouter.get("/", getProducts);
productRouter.get("/:id", getProductById);
productRouter.put("/:id", upload.array("images", 10), updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
