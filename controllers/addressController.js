// controllers/addressController.js
const Address = require("../models/Address");

exports.getAllAddresses = async (req, res) => {
  try {
    // req.user از authMiddleware می‌آید و حاوی اطلاعات کاربر (شامل id) است.
    const userId = req.user.id;
    if (!userId) {
      // این حالت نباید رخ دهد اگر authMiddleware به درستی اعمال شده باشد،
      // اما برای اطمینان یک بررسی اضافه می‌کنیم.
      return res.status(401).json({ message: "Unauthorized" });
    }
    const addresses = await Address.getAll(userId); // فراخوانی تابع مدل با userId
    res.json(addresses);
  } catch (error) {
    console.error("Error in getAllAddresses:", error);
    res.status(500).json({ message: "خطا در دریافت آدرس‌ها" });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await Address.getById(addressId); // ابتدا آدرس را فقط بر اساس ID دریافت می‌کنیم

    // بررسی می‌کنیم که آیا آدرس وجود دارد و متعلق به کاربر احراز هویت شده است
    if (!address) {
      return res.status(404).json({ message: "آدرس یافت نشد." });
    }
    if (address.user_id !== userId) {
      // اگر آدرس متعلق به کاربر دیگری است
      return res.status(403).json({ message: "دسترسی به این آدرس مجاز نیست." });
    }

    res.json(address);
  } catch (error) {
    console.error("Error in getAddressById:", error);
    res.status(500).json({ message: "خطا در دریافت آدرس" });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "کاربر احراز هویت نشده است." });
    }

    
    // داده‌های آدرس را از بدنه درخواست می‌خوانیم
    const {
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
    } = req.body;
if (!province_id || !city_id || !full_address || !tel) {
  return res.status(400).json({ message: "تمام فیلدهای ضروری باید پر شوند." });
}
    // ایجاد یک شیء آدرس شامل user_id از req.user
    const addressData = {
      user_id: userId, // user_id را از کاربر احراز هویت شده می‌گیریم
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
    };

    // فراخوانی تابع مدل برای ایجاد آدرس
    const newAddress = await Address.create(addressData);

    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Error in createAddress:", error);
    // اگر خطایی در اعتبارسنجی یا دیتابیس رخ دهد
    res.status(400).json({ message: error.message || "خطا در ایجاد آدرس" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // داده‌های به‌روزرسانی را از بدنه درخواست می‌خوانیم
    const {
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
    } = req.body;

    // ایجاد یک شیء با داده‌های به‌روزرسانی
    const updateData = {
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
      // user_id را در اینجا قرار نمی‌دهیم چون نباید قابل تغییر باشد و در مدل برای WHERE استفاده می‌شود
    };

    // فراخوانی تابع مدل برای به‌روزرسانی آدرس (مدل مالکیت را بررسی می‌کند)
    const updatedAddress = await Address.update(addressId, userId, updateData); // پاس دادن userId

    // بررسی اینکه آیا آدرسی یافت و به‌روزرسانی شد (یعنی متعلق به کاربر بود)
    if (!updatedAddress) {
      // اگر تابع update مدل null برگرداند، یعنی آدرسی با این ID و user_id یافت نشد.
      return res
        .status(404)
        .json({
          message: "آدرس جهت به‌روزرسانی یافت نشد یا متعلق به شما نیست.",
        });
    }

    res.json(updatedAddress);
  } catch (error) {
    console.error("Error in updateAddress:", error);
    res
      .status(400)
      .json({ message: error.message || "خطا در به‌روزرسانی آدرس" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // فراخوانی تابع مدل برای حذف آدرس (مدل مالکیت را بررسی می‌کند)
    const rowCount = await Address.delete(addressId, userId); // پاس دادن userId

    // بررسی اینکه آیا ردیفی حذف شد (یعنی آدرسی با این ID و user_id یافت شد)
    if (rowCount === 0) {
      return res
        .status(404)
        .json({ message: "آدرس جهت حذف یافت نشد یا متعلق به شما نیست." });
    }

    res.json({ message: "آدرس با موفقیت حذف شد." });
  } catch (error) {
    console.error("Error in deleteAddress:", error);
    res.status(500).json({ message: "خطا در حذف آدرس" });
  }
};

// تنظیم آدرس پیش‌فرض برای کاربر احراز هویت شده (این تابع قبلاً هم خوب بود، فقط مطمئن می‌شویم authMiddleware روی روتش هست)
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    const userId = req.user?.id; // userId از طریق middleware احراز هویت می‌آید

    if (!userId) {
      return res.status(401).json({ message: "احراز هویت نشده" });
    }

    const defaultAddress = await Address.setDefaultAddress(addressId, userId);

    // اگر آدرسی با این ID و user_id یافت نشد تا پیش‌فرض شود
    if (!defaultAddress) {
         return res.status(404).json({ message: "آدرس یافت نشد یا متعلق به شما نیست." });
    }

    res.json(defaultAddress);
  } catch (error) {
    console.error("Error in setDefaultAddress:", error);
    res.status(500).json({ message: "خطا در تنظیم آدرس پیش‌فرض" });
  }
};