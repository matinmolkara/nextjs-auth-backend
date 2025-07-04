// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const attributeController = require("../controllers/attributeController");

// حذف multer چون دیگر نیازی به آپلود فایل در بک‌اند نداریم
// const multer = require("multer");
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage: storage });

// Routes اصلی محصولات
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct); // حذف upload.array("images")
router.put("/:id", productController.updateProduct); // حذف upload.array("images")
router.delete("/:id", productController.deleteProduct);

// Routes مربوط به رنگ و سایز محصولات
router.get("/:id/colors", productController.getProductColors);
router.get("/:id/sizes", productController.getProductSizes);

// Routes مربوط به موجودی
router.post(
  "/:id/decrease-inventory",
  productController.decreaseProductInventory
);
router.post(
  "/:id/increase-inventory",
  productController.increaseProductInventory
);

// Routes مربوط به ویژگی‌ها و توضیحات
router.get("/:productId/attributes", attributeController.getProductAttributes);
router.get(
  "/:productId/descriptions",
  attributeController.getProductGeneralDescriptions
);

// Routes مربوط به برند
router.get("/brand/:brand_id", productController.getProductsByBrandId);

module.exports = router;
