// controllers/pageController.js
const Page = require("../models/Page");

exports.getAllPages = async (req, res) => {
  try {
    const pages = await Page.getAll();
    res.json({ success: true, data: pages });
  } catch (err) {
    console.error("Error in getAllPages:", err);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};

exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await Page.getBySlug(slug);
    if (!page)
      return res.status(404).json({ success: false, error: "صفحه پیدا نشد" });
    res.json({ success: true, data: page });
  } catch (err) {
    console.error("Error in getPageBySlug:", err);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { slug, title, content, published } = req.body;
    const newPage = await Page.create({ slug, title, content, published });
    res.json({ success: true, data: newPage });
  } catch (err) {
    console.error("Error in createPage:", err);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, title, content, published } = req.body;
    const updated = await Page.update(id, { slug, title, content, published });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Error in updatePage:", err);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    await Page.delete(id);
    res.status(204).send();
  } catch (err) {
    console.error("Error in deletePage:", err);
    res.status(500).json({ success: false, error: "خطای سرور" });
  }
};
