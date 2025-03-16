// routes/productColorRoutes.js
const express = require("express");
const router = express.Router();
const productColorController = require("../controllers/productColorController");

router.post("/", productColorController.createProductColor);
router.delete("/:product_id/:color_id", productColorController.deleteProductColor
);

module.exports = router;
