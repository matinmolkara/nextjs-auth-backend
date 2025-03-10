// controllers/provinceController.js
const Province = require("../models/Province");

exports.getAllProvinces = async (req, res) => {
  try {
    const provinces = await Province.getAll();
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProvinceById = async (req, res) => {
  try {
    const province = await Province.getById(req.params.id);
    if (!province) {
      return res.status(404).json({ message: "Province not found" });
    }
    res.json(province);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProvince = async (req, res) => {
  try {
    const province = await Province.create(req.body);
    res.status(201).json(province);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProvince = async (req, res) => {
  try {
    const province = await Province.update(req.params.id, req.body);
    res.json(province);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProvince = async (req, res) => {
  try {
    await Province.delete(req.params.id);
    res.json({ message: "Province deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
