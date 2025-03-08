const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "اطلاعات کاربری", user: req.user });
});

module.exports = router;
