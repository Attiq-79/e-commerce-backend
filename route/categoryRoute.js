import express from "express";
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, isAdmin } from "../middleware/auth.js"; // Example middlewares

const categoryRouter = express.Router();

// Admin Routes
  categoryRouter.post("/create",protect,isAdmin, createCategory);
categoryRouter.put("/:id", protect, isAdmin, updateCategory);
categoryRouter.delete("/:id", protect, isAdmin, deleteCategory);

// Public Routes
categoryRouter.get("/get", getCategories);
categoryRouter.get("/:idOrSlug", getCategory);

export default categoryRouter;
