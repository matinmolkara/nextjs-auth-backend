// controllers/ProductSizeController.js
const ProductSize = require("../models/ProductSize");

exports.createProductSize = async (req, res) => {
  try {
    const productSize = await ProductSize.create(req.body);
    res.status(201).json(productSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProductSize = async (req, res) => {
  try {
    await ProductSize.delete(req.params.product_id, req.params.size_id);
    res.json({ message: "Product size deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
