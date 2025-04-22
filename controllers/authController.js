const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const Cart = require("../models/Cart"); 
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "تمام فیلدها اجباری هستند" });
    }

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "ایمیل قبلاً ثبت شده است" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, "user"]
    );

    // ورود خودکار بعد از ثبت‌نام
    const token = generateToken(newUser.rows[0]);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "ثبت‌نام موفقیت‌آمیز بود",
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در ثبت نام کاربر" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "لطفاً تمام فیلدها را پر کنید" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: "کاربر یافت نشد" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "رمز عبور نادرست است" });
    }

    const token = generateToken(user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ادغام سبد مهمان در صورت وجود
    const guestCartId = req.session?.guestCartId || req.cookies?.guestCartId;
    if (guestCartId) {
      await Cart.mergeGuestCartWithUserCart(guestCartId, user.id);
      delete req.session.guestCartId;
      res.clearCookie("guestCartId");
    }

    res.json({
      message: "ورود موفقیت‌آمیز بود",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در ورود کاربر" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.json({ message: "خروج از حساب کاربری موفقیت‌آمیز بود" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در خروج از حساب کاربری" });
  }
};

// ✅ مسیر جدید: بررسی کاربر فعلی با کوکی
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: "کاربر یافت نشد" });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر" });
  }
};
