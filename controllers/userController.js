// controllers/userController.js
const User = require("../models/User");
// ایمپورت کردن middleware احراز هویت و مجوز (فرضی)
// const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

exports.getAllUsers = async (req, res) => {
  // **نیاز به:** authenticateJWT, authorizeRole('admin')
  try {
    const users = await User.getAll(); // مدل حالا فیلدهای عمومی را برمی گرداند
    res.json(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  // **نیاز به:** authenticateJWT
  // **نیاز به مجوز:** req.user.id === req.params.id OR req.user.role === 'admin'
  try {
    const user = await User.getById(req.params.id); // مدل حالا فیلدهای عمومی را برمی گرداند
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // اعمال مجوز پس از واکشی کاربر
    // if (req.user.role !== 'admin' && req.user.id !== user.id) {
    //      return res.status(403).json({ message: "Forbidden" });
    // }
    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// تابع ایجاد کاربر جدید (معمولاً برای ثبت نام یا توسط ادمین)
exports.createUser = async (req, res) => {
  // اگر برای ثبت نام است: نیازی به مجوز نیست، role='user' ثابت
  // اگر توسط ادمین است: نیاز به authenticateJWT, authorizeRole('admin')
  try {
    // خواندن تمام فیلدهایی که مدل create می پذیرد از بدنه درخواست
    const {
      name,
      email,
      password,
      role,
      phone,
      national_id,
      last_name,
      avatar_url,
      date_of_birth,
      gender,
    } = req.body;

    // اعتبار سنجی اولیه ورودی ها (می توانید اعتبار سنجی های پیچیده تر اضافه کنید)
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    // چک کردن تکراری بودن ایمیل
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user", // اگر نقش تعیین نشده بود، پیش فرض 'user' باشد
      phone,
      national_id,
      last_name,
      avatar_url,
      date_of_birth,
      gender,
    });

    // در پاسخ، اطلاعات کاربر را بدون فیلدهای حساس برگردانید (مدل این کار را در RETURNING انجام می دهد)
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    // پیام خطای مربوطه را برگردانید (مثلاً خطای اعتبار سنجی از مدل یا تکراری بودن ایمیل)
    res.status(400).json({ message: error.message || "Error creating user" });
  }
};

// تابع به‌روزرسانی اطلاعات کاربر
exports.updateUser = async (req, res) => {
  // **نکته امنیتی حیاتی:**
  // **نیاز به:** authenticateJWT
  // **نیاز به مجوز:** req.user.id === req.params.id OR req.user.role === 'admin'
  // این مسیر هم برای ادمین و هم برای کاربر عادی (ویرایش پروفایل خودش) استفاده می شود
  try {
    const userId = req.params.id;
    // در اینجا چک امنیتی را انجام دهید:
    // if (req.user.role !== 'admin' && req.user.id !== userId) {
    //      return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
    // }

    // خواندن تمام فیلدهای ممکن که مدل update می پذیرد از بدنه درخواست
    const updateData = req.body;

    // اگر کاربر عادی این درخواست را می‌فرستد (و ادمین نیست)، فیلدهایی که نباید تغییر دهد را حذف کنید
    // این کار از تلاش کاربر برای تغییر نقش یا ایمیل خود جلوگیری می‌کند.
    // مثال:
    // if (req.user && req.user.role !== 'admin') {
    //      delete updateData.role; // کاربر عادی نمی تواند نقش خود را تغییر دهد
    //      // اگر اجازه تغییر ایمیل را نمی دهید، email را هم حذف کنید
    //      // delete updateData.email;
    //      // فیلدهای سیستمی که کاربر نباید مستقیماً تغییر دهد
    //      delete updateData.is_active;
    //      delete updateData.last_login_at;
    //      delete updateData.email_verified_at;
    //      delete updateData.phone_verified_at;
    //      delete updateData.reset_password_token;
    //      delete updateData.reset_password_expires;
    // }

    const updatedUser = await User.update(userId, updateData); // مدل حالا فیلدهای موجود در updateData را هندل می کند

    if (!updatedUser) {
      // اگر کاربر با آن ID پیدا نشد (پس از اعمال مجوز یا اگر مدل null برگرداند)
      return res
        .status(404)
        .json({ message: "User not found or no changes applied." });
    }

    res.json(updatedUser); // مدل حالا کاربر به‌روز شده بدون پسورد را برمی‌گرداند
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(400).json({ message: error.message || "Error updating user" }); // پیام خطای مدل
  }
};

exports.deleteUser = async (req, res) => {
  // **نیاز به:** authenticateJWT, authorizeRole('admin') (معمولاً فقط ادمین)
  // **یا:** authenticateJWT و req.user.id === req.params.id (حذف اکانت خود توسط کاربر)
  try {
    const userId = req.params.id;
    // در اینجا چک امنیتی را انجام دهید
    // if (req.user.role !== 'admin' && req.user.id !== userId) {
    //      return res.status(403).json({ message: "Forbidden: You can only delete your own account." });
    // }

    await User.delete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// همانطور که قبلا اشاره شد، برای ویرایش پروفایل خود کاربر، بهتر است
// یک مسیر و کنترلر جداگانه در بخش احراز هویت (authRoutes) داشته باشید.
// مثال:
/*
// controllers/authController.js (تابع updateProfile)
exports.updateProfile = async (req, res) => {
    // **نیاز به:** authenticateJWT
    // در این تابع، شما اطلاعات کاربر احراز هویت شده را از req.user دارید
    // و ID کاربر مشخص است، نیازی به req.params.id نیست.
    try {
        const userId = req.user.id; // ID کاربر لاگین کرده

        // فیلدهایی که کاربر از طریق فرم پروفایل می تواند تغییر دهد را از req.body بخوانید
        // در اینجا فقط فیلدهایی که مدل User.update در allowedUpdateFields دارد و کاربر عادی مجاز به تغییر آنهاست را می گیریم
        const {
            name, last_name, phone, national_id, avatar_url,
            date_of_birth, gender, password // شامل پسورد برای تغییر رمز عبور
            // role و email و فیلدهای سیستمی را از اینجا نخوانید
        } = req.body;

        // ساخت شیء داده برای به‌روزرسانی
        const updateData = {
            name, last_name, phone, national_id, avatar_url,
            date_of_birth, gender
        };

        // اگر پسورد جدیدی فرستاده شده، آن را اضافه کنید (مدل خودش آن را هش می کند)
        if (password !== undefined && password !== null && password !== '') {
            updateData.password = password;
        }

        // فیلدهای دیگر (مانند role, email, is_active, last_login_at و...) نباید از این طریق تغییر کنند
        // مدل User.update هم این فیلدها را اگر در allowedUpdateFields نباشند نادیده می گیرد
        // اما بهتر است در کنترلر نیز فقط فیلدهای مجاز را از body بخوانید.


        const updatedUser = await User.update(userId, updateData); // ارسال داده ها به مدل

        if (!updatedUser) {
             // این نباید رخ دهد اگر کاربر لاگین کرده وجود داشته باشد
             return res.status(500).json({ message: "Error updating profile: User not found." });
        }

        // در پاسخ، اطلاعات به‌روز شده کاربر (بدون فیلدهای حساس) را برگردانید
        res.json(updatedUser);

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(400).json({ message: error.message || "Error updating profile" });
    }
};
*/
