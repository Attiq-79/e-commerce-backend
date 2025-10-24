import ProductModel from "../models/product.model.js";
import uploadImageCloudinary from "../utils/uploadImageClodinary.js";

// @desc    Create new product
// @route   POST /api/products


export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, sku, category } = req.body;

    // images cloudinary pe upload karo
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploaded = await uploadImageCloudinary(file);
        imageUrls.push(uploaded.secure_url);
      }
    }

    const product = new ProductModel({
      name,
      description,
      price,
      stock,
      sku,
      category,
      images: imageUrls,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get all products
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find().populate("category", "name");
    res
      .status(200)
      .json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id).populate(
      "category",
      "name"
    );
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, sku, category } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ If new images are uploaded
    if (req.files && req.files.length > 0) {
      // Purani images Cloudinary se delete karo
      if (product.images && product.images.length > 0) {
        for (let img of product.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      // Nayi images upload karo
      const uploadedImages = [];
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        uploadedImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      product.images = uploadedImages;
    }

    // ✅ Update other fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.sku = sku || product.sku;
    product.category = category || product.category;

    await product.save();

    res.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
