// controllers/cityController.js
const City = require("../models/City");

exports.getAllCities = async (req, res) => {
  try {
    const cities = await City.getAll();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCityById = async (req, res) => {
  try {
    const city = await City.getById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { name, province_id } = req.body; // اصلاح: اضافه کردن province_id
    const city = await City.create({ name, province_id }); // اصلاح: اضافه کردن province_id
    res.status(201).json(city);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { name, province_id } = req.body; // اصلاح: اضافه کردن province_id
    const city = await City.update(req.params.id, { name, province_id }); // اصلاح: اضافه کردن province_id
    res.json(city);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    await City.delete(req.params.id);
    res.json({ message: "City deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
