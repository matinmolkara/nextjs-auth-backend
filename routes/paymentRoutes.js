const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentsController");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/initiate", controller.initiatePayment);
router.get("/callback", controller.verifyPayment);

module.exports = router;
