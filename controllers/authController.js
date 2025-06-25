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
      { id: newUser.rows[0].id, email: email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "24h" }
    );

    // ✅ URL تایید برای production
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;

    // ✅ HTML Template زیبا
    const emailHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tahoma', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 خوش آمدید ${name}!</h1>
          <p>به خانواده MyApp خوش اومدی</p>
        </div>
        <div class="content">
          <h2>تایید حساب کاربری</h2>
          <p>سلام ${name} عزیز،</p>
          <p>برای فعال‌سازی حساب کاربری خود روی دکمه زیر کلیک کنید:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">✅ تایید حساب کاربری</a>
          </div>
          
          <p>یا می‌تونید روی لینک زیر کلیک کنید:</p>
          <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ توجه:</strong> این لینک تا 24 ساعت معتبر است.
          </div>
        </div>
        <div class="footer">
          <p>اگر شما این حساب را ایجاد نکرده‌اید، این ایمیل را نادیده بگیرید.</p>
          <p>© 2025 MyApp - تمامی حقوق محفوظ است</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      await sendEmail(email, "🔐 تایید حساب کاربری - MyApp", emailHTML);

      res.status(201).json({
        message: "ثبت‌نام موفق. لینک تایید به ایمیل ارسال شد.",
        success: true,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      // ✅ حساب ساخته شد ولی ایمیل ارسال نشد
      res.status(201).json({
        message:
          "ثبت‌نام موفق ولی خطا در ارسال ایمیل. لطفاً درخواست ارسال مجدد کنید.",
        success: true,
        emailError: true,
        userEmail: email,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "خطا در ثبت نام کاربر" });
  }
};

// ✅ بهبود resend verification
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "کاربر یافت نشد." });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "ایمیل قبلاً تایید شده است." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "24h" }
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const emailHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tahoma', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔄 ارسال مجدد لینک تایید</h2>
        <p>سلام ${user.name} عزیز،</p>
        <p>درخواست ارسال مجدد لینک تایید شما دریافت شد.</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">✅ تایید حساب کاربری</a>
        </div>
        
        <p>این لینک تا 24 ساعت معتبر است.</p>
      </div>
    </body>
    </html>
    `;

    await sendEmail(email, "🔄 ارسال مجدد لینک تایید - MyApp", emailHTML);

    res.json({ message: "لینک تایید مجدد ارسال شد." });
  } catch (error) {
    console.error("Resend email error:", error);
    res.status(500).json({ message: "خطا در ارسال مجدد ایمیل." });
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
      secure: true,
      sameSite: 'None',
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
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/", // ✅ اضافه کردن path
    });
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
      return res.status(404).json({ message: "کاربر یافت نشد." });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ message: "ایمیل قبلاً تایید شده است." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_EMAIL_SECRET,
      { expiresIn: "24h" }
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const emailHTML = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Tahoma', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔄 ارسال مجدد لینک تایید</h2>
        <p>سلام ${user.name} عزیز،</p>
        <p>درخواست ارسال مجدد لینک تایید شما دریافت شد.</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">✅ تایید حساب کاربری</a>
        </div>
        
        <p>این لینک تا 24 ساعت معتبر است.</p>
      </div>
    </body>
    </html>
    `;

    await sendEmail(email, "🔄 ارسال مجدد لینک تایید - MyApp", emailHTML);

    res.json({ message: "لینک تایید مجدد ارسال شد." });
  } catch (error) {
    console.error("Resend email error:", error);
    res.status(500).json({ message: "خطا در ارسال مجدد ایمیل." });
  }
};