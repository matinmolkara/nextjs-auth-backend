const express = require("express");
const router = express.Router();
const controller = require("../controllers/productAttributesController");

// دریافت ویژگی‌های مربوط به یک دسته‌بندی
router.get("/category/:categoryId", controller.getAttributesByCategory);

// ویژگی‌های یک محصول
router.get("/product/:productId", controller.getProductAttributes);
router.post("/product/:productId", controller.addAttributeValues);

// توضیحات عمومی محصول
router.get(
  "/product/:productId/descriptions",
  controller.getProductGeneralDescriptions
);
router.post(
  "/product/:productId/descriptions",
  controller.addGeneralDescriptions
);

module.exports = router;
