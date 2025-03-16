// routes/sizeRoutes.js
const express = require("express");
const router = express.Router();
const sizeController = require("../controllers/sizeController");

router.get("/", sizeController.getAllSizes);
router.get("/:id", sizeController.getSizeById);
router.post("/", sizeController.createSize);
router.put("/:id", sizeController.updateSize);
router.delete("/:id", sizeController.deleteSize);

module.exports = router;
