const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", cartController.getCart);
router.post("/add", cartController.addToCart);
router.post("/update", cartController.updateQuantity);
router.post("/remove", cartController.removeFromCart);
router.post("/clear", cartController.clearCart);

module.exports = router;
