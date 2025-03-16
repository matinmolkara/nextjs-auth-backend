// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });





router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", upload.array("images"), productController.createProduct); // اصلاح: اضافه کردن upload.array('images')
router.put("/:id", upload.array("images"), productController.updateProduct); // اصلاح: اضافه کردن upload.array('images')
router.delete("/:id", productController.deleteProduct);
router.get("/:id/colors", productController.getProductColors);
router.get("/:id/sizes", productController.getProductSizes);
module.exports = router;
