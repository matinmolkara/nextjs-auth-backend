// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const attributeController = require("../controllers/attributeController");
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
router.post(
  "/:id/decrease-inventory",
  productController.decreaseProductInventory
);
router.post(
  "/:id/increase-inventory",
  productController.increaseProductInventory
);




router.get("/:productId/attributes", attributeController.getProductAttributes);
router.get(
  "/:productId/descriptions",
  attributeController.getProductGeneralDescriptions
);
router.get("/brand/:brand_id", productController.getProductsByBrandId);



module.exports = router;
