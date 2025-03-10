// routes/provinceRoutes.js
const express = require("express");
const router = express.Router();
const provinceController = require("../controllers/provinceController");

router.get("/", provinceController.getAllProvinces);
router.get("/:id", provinceController.getProvinceById);
router.post("/", provinceController.createProvince);
router.put("/:id", provinceController.updateProvince);
router.delete("/:id", provinceController.deleteProvince);

module.exports = router;
