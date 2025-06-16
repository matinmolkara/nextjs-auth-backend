const AttributeKey = require("../models/AttributeKey");
const CategoryAttributeKey = require("../models/CategoryAttributeKey");
const ProductGeneralDescription = require("../models/ProductGeneralDescription");
const AttributeValue = require("../models/AttributeValue");
exports.getAllAttributes = async (req, res) => {
  try {
    const attrs = await AttributeKey.getAll();
    res.json(attrs);
  } catch (error) {
    res.status(500).json({ error: "خطا در دریافت ویژگی‌ها" });
  }
};


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


// افزودن ویژگی‌ها به دسته‌بندی
exports.addAttributesToCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { attributes } = req.body; // [{ attribute_id, is_required }]
  try {
    const results = [];
    for (const attr of attributes) {
      if (!attr.attribute_id || isNaN(attr.attribute_id)) {
        return res.status(400).json({ error: "attribute_id نامعتبر است" });
      }
     

      const record = await CategoryAttributeKey.create({
        category_id: categoryId,
        attribute_id: parseInt(attr.attribute_id),
        is_required: attr.is_required || false,
      });
      results.push(record);
    }
    res.status(201).json(results);
  } catch (error) {
    console.error("❌ خطا در افزودن ویژگی به دسته:", error);
    res.status(500).json({ error: "خطا در ذخیره ویژگی‌ها",detail: error.message  });
  }
};

// ساخت ویژگی جدید
exports.createAttributeKey = async (req, res) => {
  try {
    const { name, input_type, is_custom = false } = req.body;
    const attr = await AttributeKey.create({ name, input_type, is_custom });
    res.status(201).json(attr);
  } catch (error) {
    res.status(400).json({ error: "خطا در ایجاد ویژگی جدید" });
  }
};

// حذف ویژگی
exports.deleteAttributeKey = async (req, res) => {
  try {
    await AttributeKey.deleteById(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "خطا در حذف ویژگی" });
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

exports.getProductAttributes = async (req, res) => {
  try {
    const data = await AttributeValue.getByProductId(req.params.productId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};