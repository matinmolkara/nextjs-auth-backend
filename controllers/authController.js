const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const Cart = require("../models/Cart"); 
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
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

    const emailToken = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "1d" }
    );

    const url = `http://localhost:5000/api/auth/verify-email?token=${emailToken}`;

    await sendEmail(
      email,
      "تایید ایمیل",
      `<h3>برای فعال سازی حساب روی لینک زیر کلیک کن:</h3><a href="${url}">${url}</a>`
    );

    res.status(201).json({
      message: "ثبت‌نام موفق. لینک تایید به ایمیل ارسال شد.",
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
    if (!user.is_verified) {
      return res
        .status(401)
        .json({ message: "ابتدا ایمیل خود را تایید کنید." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "رمز عبور نادرست است" });
    }


    user.last_login_at = new Date();
    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      user.id,
    ]);
    

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
      phone: user.phone, // این فیلدها را اضافه کنید
      national_id: user.national_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در دریافت اطلاعات کاربر" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const user = await User.getById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }


    const finalUpdateData = {};

 
    if (updateData.name !== undefined) {
  
      finalUpdateData.name = updateData.name;
    }

    if (updateData.phone !== undefined) {
 
      finalUpdateData.phone = updateData.phone;
    }


    if (updateData.password !== undefined && updateData.password !== "") {
      finalUpdateData.password = updateData.password;
    }

    // --- منطق اصلی برای فیلد کد ملی ---
    const nationalIdFromRequest = updateData.national_id;
    const existingNationalId = user.national_id; 

 
    if (nationalIdFromRequest !== undefined) {
  
      if (existingNationalId && String(existingNationalId).trim() !== "") {
 
        return res
          .status(400)
          .json({ message: "National ID cannot be changed once set." });
      } else {
        
        const cleanedNationalId = String(nationalIdFromRequest).trim(); 
        if (!/^\d{10}$/.test(cleanedNationalId)) {
          return res
            .status(400)
            .json({
              message: "Invalid National ID format. Must be exactly 10 digits.",
            });
        }
  
        finalUpdateData.national_id = cleanedNationalId;
      }
    }

    if (Object.keys(finalUpdateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });

    }

    const updatedUser = await User.update(userId, updateData);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: "User not found or no changes applied." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(400)
      .json({ message: error.message || "Error updating profile" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
      decoded.id,
    ]);
    res.send("ایمیل شما تایید شد. حالا می‌توانید وارد شوید.");
  } catch (error) {
    res.status(400).send("توکن نامعتبر یا منقضی.");
  }
};

exports.resendVerificationEmail = async (req, res) => {
 
  const { email } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_EMAIL_SECRET, {
      expiresIn: "1h",
    });

    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail(
      email,
      "لینک تایید مجدد ایمیل",
      `<p>برای تایید ایمیل روی لینک زیر کلیک کنید:</p><a href="${verificationLink}">${verificationLink}</a>`
    );

    res.json({ message: "Verification email sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};