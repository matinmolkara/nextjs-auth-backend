const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", contactController.createMessage);
router.get("/", contactController.getMessages); // فقط برای ادمین
router.get("/:id", contactController.getMessageById);
router.delete("/:id", contactController.deleteMessage); // فقط برای ادمین

module.exports = router;
