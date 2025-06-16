const express = require("express");
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  verifyEmail, // ✅ جدید
  resendVerificationEmail, // ✅ جدید
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "اطلاعات کاربری", user: req.user });
});
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/verify-email", verifyEmail); // ✅ مسیر تایید ایمیل جدید
router.post(
  "/resend-verification",
  (req, res, next) => {

    next();
  },
  resendVerificationEmail
);

module.exports = router;
