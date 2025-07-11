// routes/brandRoutes.js
const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.post("/", brandController.createBrand);
router.put("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);

module.exports = router;
