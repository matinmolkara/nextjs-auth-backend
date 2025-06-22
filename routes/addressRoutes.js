// routes/addressRoutes.js
const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { authMiddleware } = require("../middlewares/authMiddleware");

// اعمال authMiddleware برای تمام روت‌های مدیریت آدرس کاربر
// این تضمین می‌کند که req.user حاوی اطلاعات کاربر احراز هویت شده خواهد بود.

router.get("/", authMiddleware, addressController.getAllAddresses); // دریافت تمام آدرس‌های کاربر
router.get("/:id", authMiddleware, addressController.getAddressById); // دریافت آدرس خاص کاربر
router.post("/", authMiddleware, addressController.createAddress); // ایجاد آدرس برای کاربر
router.put("/:id", authMiddleware, addressController.updateAddress); // به‌روزرسانی آدرس کاربر
router.delete("/:id", authMiddleware, addressController.deleteAddress); // حذف آدرس کاربر
router.post(
  "/set-default",
  authMiddleware,
  addressController.setDefaultAddress
); // تنظیم آدرس پیش‌فرض کاربر

module.exports = router;
