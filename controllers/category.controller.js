import CategoryModel from "../models/category.model.js";
import slugify from "slugify"; // Install: npm i slugify

// 📌 Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const slug = slugify(name, { lower: true, strict: true });

    // Check if category already exists
    const existing = await CategoryModel.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await CategoryModel.create({
      name,
      slug,
      description,
      parentCategory: parentCategory || null,
      createdBy: req.user._id, // Assuming you have auth middleware
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get All Categories
export const getCategories = async (req, res) => {
  try {
    const { search, parent } = req.query;

    let filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    if (parent) filter.parentCategory = parent;

    const categories = await CategoryModel.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Get Single Category (by ID or Slug)
export const getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const category = await CategoryModel.findOne({
      $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Update Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parentCategory } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) updateData.description = description;
    if (parentCategory !== undefined) updateData.parentCategory = parentCategory;

    const category = await CategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📌 Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
