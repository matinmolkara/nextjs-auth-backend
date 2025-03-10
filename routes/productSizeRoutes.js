// routes/productSizeRoutes.js
const express = require("express");
const router = express.Router();
const productSizeController = require("../controllers/productSizeController");

router.post("/", productSizeController.createProductSize);
router.delete("/:product_id/:size_id", productSizeController.deleteProductSize);

module.exports = router;
