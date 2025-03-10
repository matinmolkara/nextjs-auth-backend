// controllers/commentController.js
const Comment = require("../models/Comment");

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.getAll();
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.getById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { user_id, product_id, rating, text, response } = req.body; // اصلاح: اضافه کردن پارامترها
    const comment = await Comment.create({
      user_id,
      product_id,
      rating,
      text,
      response,
    }); // اصلاح: اضافه کردن پارامترها
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { user_id, product_id, rating, text, response } = req.body; // اصلاح: اضافه کردن پارامترها
    const comment = await Comment.update(req.params.id, {
      user_id,
      product_id,
      rating,
      text,
      response,
    }); // اصلاح: اضافه کردن پارامترها
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.delete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.delete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
