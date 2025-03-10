// controllers/ProductCategoryController.js
const ProductCategory = require("../models/ProductCategory");

exports.createProductCategory = async (req, res) => {
  try {
    const productCategory = await ProductCategory.create(req.body);
    res.status(201).json(productCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProductCategory = async (req, res) => {
  try {
    await ProductCategory.delete(req.params.product_id, req.params.category_id);
    res.json({ message: "Product category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductCategoriesByProductId = async (req, res) => {
  try {
    const productCategories = await ProductCategory.findByProductId(
      req.params.product_id
    );
    res.json(productCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductCategoriesByCategoryId = async (req, res) => {
  try {
    const productCategories = await ProductCategory.findByCategoryId(
      req.params.category_id
    );
    res.json(productCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
