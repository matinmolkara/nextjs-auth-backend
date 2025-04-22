const express = require("express");
const { register, login, logout,getCurrentUser } = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "اطلاعات کاربری", user: req.user });
});

module.exports = router;
