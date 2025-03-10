// controllers/addressController.js
const Address = require("../models/Address");

exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.getAll();
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const address = await Address.getById(req.params.id);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const {
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
    } = req.body;
    const address = await Address.create({
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
    });
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const {
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
    } = req.body;
    const address = await Address.update(req.params.id, {
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
    });
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    await Address.delete(req.params.id);
    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
