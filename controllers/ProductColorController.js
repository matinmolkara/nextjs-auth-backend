// controllers/ProductColorController.js
const ProductColor = require("../models/ProductColor");

exports.createProductColor = async (req, res) => {
  try {
    const productColor = await ProductColor.create(req.body);
    res.status(201).json(productColor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProductColor = async (req, res) => {
  try {
    await ProductColor.delete(req.params.product_id, req.params.color_id);
    res.json({ message: "Product color deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
