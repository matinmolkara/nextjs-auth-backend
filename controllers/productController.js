// controllers/productController.js
const Product = require("../models/Product");
const ProductColor = require("../models/ProductColor");
const ProductSize = require("../models/ProductSize");
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const colors = await ProductColor.getProductColors(req.params.id);
    res.json({ ...product, colors });
   
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      category_id,
      brand_id,
      special_offer,
      color_ids,
    } = req.body;
    const image_urls = req.files.map(
      (file) => `http://localhost:5000/uploads/${file.filename}`
    ); // دریافت URL تصاویر آپلود شده
    const product = await Product.create({
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
    });
    if (color_ids && color_ids.length > 0) {
      for (const color_id of color_ids) {
        await ProductColor.create({ product_id: product.id, color_id });
      }
    }
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      category_id,
      brand_id,
      special_offer,
      color_ids,
    } = req.body;
    const image_urls = req.files.map(
      (file) => `http://localhost:5000/uploads/${file.filename}`
    ); // دریافت URL تصاویر آپلود شده
    const product = await Product.update(req.params.id, {
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
    });
     await ProductColor.deleteProductColors(req.params.id);

     if (color_ids && color_ids.length > 0) {
       for (const color_id of color_ids) {
         await ProductColor.create({ product_id: req.params.id, color_id });
       }
     }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductColors = async (req, res) => {
  try {
    console.log("req.params:", req.params); 
    const productId = Number(req.params.id);
    console.log("Fetching colors for product_id:", productId);
    const colors = await ProductColor.getProductColors(productId);
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductSizes = async (req, res) => {
  try {
    console.log("req.params:", req.params);
    const productId = Number(req.params.id);
    console.log("Fetching sizes for product_id:", productId);
    const sizes = await ProductSize.getProductSizes(productId);
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
