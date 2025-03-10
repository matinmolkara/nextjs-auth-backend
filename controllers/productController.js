// controllers/productController.js
const Product = require("../models/Product");

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
    res.json(product);
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
      image_url,
      category_id,
      brand_id,
      special_offer,
    } = req.body;
    const product = await Product.create({
      title,
      description,
      price,
      real_price,
      discount,
      image_url,
      category_id,
      brand_id,
      special_offer,
    });
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
      image_url,
      category_id,
      brand_id,
      special_offer,
    } = req.body;
    const product = await Product.update(req.params.id, {
      title,
      description,
      price,
      real_price,
      discount,
      image_url,
      category_id,
      brand_id,
      special_offer,
    });
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
