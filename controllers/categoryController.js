// controllers/categoryController.js
const Category = require("../models/Category");

exports.getAllCategories = async (req, res) => {
  try {
    const {
      search,
      level1_id,
      level2_id,
      level3_id,
      page = 1, 
      pageSize = 15, 
      all, 
    } = req.query;

    let categories;
    let totalCount;

    if (all === "true") {
      
      categories = await Category.getAll();
      totalCount = categories.length; 
    } else {
      
      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      const filterOptions = {
        search,
        level1_id: level1_id ? parseInt(level1_id) : undefined,
        level2_id: level2_id ? parseInt(level2_id) : undefined,
        level3_id: level3_id ? parseInt(level3_id) : undefined,
      };

      const result = await Category.getFilteredAndPaginated({
        ...filterOptions,
        limit: parseInt(pageSize),
        offset,
      });

      categories = result.categories;
      totalCount = result.totalCount;
    }

    res.json({ categories, totalCount });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body; // اصلاح: دریافت name و parent_id
    const category = await Category.create({ name, parent_id }); // اصلاح: ارسال name و parent_id
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, parent_id } = req.body; // اصلاح: دریافت name و parent_id
    const category = await Category.update(req.params.id, { name, parent_id }); // اصلاح: ارسال name و parent_id
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.delete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
