// controllers/brandController.js
const Brand = require("../models/Brand");
const Product = require("../models/Product");
exports.getAllBrands = async (req, res) => {
  try {
    const { search = "", page = 1, pageSize = 15 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const brands = await Brand.getAll(search, skip, pageSize);
    const totalCount = await Brand.countAll(search);

    res.json({ brands, totalCount });
  } catch (error) {
    console.error("خطا در دریافت برندها:", error);
    res.status(500).json({ message: "خطا در دریافت برندها" });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.getById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body; // اصلاح: دریافت name
    const brand = await Brand.create({ name }); // اصلاح: ارسال name
    res.status(201).json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body; // اصلاح: دریافت name
    const brand = await Brand.update(req.params.id, { name }); // اصلاح: ارسال name
    res.json(brand);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    const products = await Product.getByBrandId(brandId);
    if (products.length > 0) {
      return res
        .status(400)
        .json({ message: "این برند دارای محصول است و قابل حذف نیست." });
    }

    await Brand.delete(brandId);
    res.json({ message: "برند حذف شد" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

