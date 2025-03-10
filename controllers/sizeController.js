// controllers/sizeController.js
const Size = require("../models/Size");

exports.getAllSizes = async (req, res) => {
  try {
    const sizes = await Size.getAll();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSizeById = async (req, res) => {
  try {
    const size = await Size.getById(req.params.id);
    if (!size) {
      return res.status(404).json({ message: "Size not found" });
    }
    res.json(size);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createSize = async (req, res) => {
  try {
    const { size, type } = req.body; // اصلاح: دریافت size و type
    const newSize = await Size.create({ size, type }); // اصلاح: ارسال size و type
    res.status(201).json(newSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const { size, type } = req.body; // اصلاح: دریافت size و type
    const updatedSize = await Size.update(req.params.id, { size, type }); // اصلاح: ارسال size و type
    res.json(updatedSize);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    await Size.delete(req.params.id);
    res.json({ message: "Size deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
