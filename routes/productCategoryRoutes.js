// routes/productCategoryRoutes.js
const express = require("express");
const router = express.Router();
const productCategoryController = require("../controllers/productCategoryController");

router.post("/", productCategoryController.createProductCategory);
router.delete(
  "/:product_id/:category_id",
  productCategoryController.deleteProductCategory
);
router.get(
  "/product/:product_id",
  productCategoryController.getProductCategoriesByProductId
);
router.get(
  "/category/:category_id",
  productCategoryController.getProductCategoriesByCategoryId
);

module.exports = router;
