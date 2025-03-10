// routes/colorRoutes.js
const express = require("express");
const router = express.Router();
const colorController = require("../controllers/colorController");

router.get("/", colorController.getAllColors);
router.get("/:id", colorController.getColorById);
router.post("/", colorController.createColor);
router.put("/:id", colorController.updateColor);
router.delete("/:id", colorController.deleteColor);

module.exports = router;
