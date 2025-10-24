import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // removes leading/trailing spaces
    },
    slug: {
      type: String,
      required: true,
      unique: true, // unique index
      lowercase: true, // store slug in lowercase
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to admin who created this category
      required: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

// 🔍 Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ name: "text" }); // for search

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
