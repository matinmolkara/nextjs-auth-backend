// routes/attributeRoutes.js
const express = require("express");
const router = express.Router();
const attributeController = require("../controllers/attributeController");

// گرفتن همه ویژگی‌ها
router.get("/", attributeController.getAllAttributes);
router.get(
  "/categories/:categoryId",
  attributeController.getAttributesByCategory
);

// افزودن ویژگی‌های مشترک به یک دسته‌بندی
router.post(
  "/categories/:categoryId",
  attributeController.addAttributesToCategory
);
router.post("/", attributeController.createAttributeKey);
router.delete("/:id", attributeController.deleteAttributeKey);
router.post(
  "/categories/:categoryId/attributes",
  attributeController.addAttributesToCategory
);

module.exports = router;
