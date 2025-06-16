
const CategoryAttributeKey = require("../models/CategoryAttributeKey");
const AttributeValue = require("../models/AttributeValue");
const ProductGeneralDescription = require("../models/ProductGeneralDescription");

exports.getAttributesByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const data = await CategoryAttributeKey.getDetailedAttributesByCategoryId(
      categoryId
    );
    res.json(data);
  } catch (error) {
    console.error("🔥 خطا در دریافت ویژگی‌های دسته:", error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getProductAttributes = async (req, res) => {
  try {
    const data = await AttributeValue.getByProductId(req.params.productId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addAttributeValues = async (req, res) => {
  try {
    const { values } = req.body; // [{attribute_id, value}]
    const product_id = req.params.productId;
    const results = [];
    for (const v of values) {
      const r = await AttributeValue.create({ product_id, ...v });
      results.push(r);
    }
    res.status(201).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProductGeneralDescriptions = async (req, res) => {
  try {
    const descriptions = await ProductGeneralDescription.getByProductId(
      req.params.productId
    );
    res.json(descriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addGeneralDescriptions = async (req, res) => {
  try {
    const { descriptions } = req.body; // [{title, content}]
    const product_id = req.params.productId;
    const results = [];
    for (const desc of descriptions) {
      const r = await ProductGeneralDescription.create({ product_id, ...desc });
      results.push(r);
    }
    res.status(201).json(results);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
