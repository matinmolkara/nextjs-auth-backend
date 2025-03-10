// controllers/brandController.js
const Brand = require("../models/Brand");

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.getAll();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    await Brand.delete(req.params.id);
    res.json({ message: "Brand deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
