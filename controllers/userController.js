// controllers/userController.js
const User = require("../models/User");
const pool = require("../config/db");

// controllers/userController.js

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let query =
      "SELECT id, created_at, " +
      User.publicFields.join(", ") +
      " FROM users WHERE 1=1";
    const params = [];

    // 🟡 اصلاح فقط این بخش:
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length}`;
      params.push(`%${search}%`);
      query += ` OR email ILIKE $${params.length})`;
    }

    if (role) {
      params.push(role);
      query += ` AND role = $${params.length}`;
    }

    if (status === "active") {
      query += ` AND is_active = true`;
    } else if (status === "inactive") {
      query += ` AND is_active = false`;
    }

    params.push(Number(pageSize), Number(offset));
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${
      params.length
    }`;
    
    
    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (error) {
    console.error("خطا در گرفتن لیست کاربران:", error);
    res.status(500).json({ message: "خطا در گرفتن کاربران" });
  }
};


exports.getUserById = async (req, res) => {
  
  try {
    const user = await User.getById(req.params.id); // مدل حالا فیلدهای عمومی را برمی گرداند
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error getting user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.createUser = async (req, res) => {
  
  try {
    
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
      is_active,
      is_verified,
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
      is_active: is_active === false ? false : true,
      is_verified: is_verified === true ? true : false,
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
  
  try {
    const userId = req.params.id;
    
if (req.user.role !== "admin" && req.user.id !== userId) {
  return res.status(403).json({ message: "Unauthorized access" });
}


    const updateData = req.body;

   

    const updatedUser = await User.update(userId, updateData); // مدل حالا فیلدهای موجود در updateData را هندل می کند

    if (!updatedUser) {
     
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
  
  try {
    const userId = req.params.id;
    

    await User.delete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUsersCount = async (req, res) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    res.json({ total: Number(result.rows[0].total) });
  } catch (error) {
    console.error("خطا در گرفتن تعداد کاربران:", error);
    res.status(500).json({ message: "خطا در گرفتن تعداد" });
  }
};
