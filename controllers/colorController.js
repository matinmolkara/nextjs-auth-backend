// controllers/colorController.js
const Color = require("../models/Color");

exports.getAllColors = async (req, res) => {
  try {
    const colors = await Color.getAll();
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getColorById = async (req, res) => {
  try {
    const color = await Color.getById(req.params.id);
    if (!color) {
      return res.status(404).json({ message: "Color not found" });
    }
    res.json(color);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createColor = async (req, res) => {
  try {
    const color = await Color.create(req.body);
    res.status(201).json(color);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateColor = async (req, res) => {
  try {
    const color = await Color.update(req.params.id, req.body);
    res.json(color);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteColor = async (req, res) => {
  try {
    await Color.delete(req.params.id);
    res.json({ message: "Color deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
