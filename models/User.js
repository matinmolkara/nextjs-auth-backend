// models/User.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

class User {
  // فیلدهایی که برای امنیت به فرانت‌اند ارسال نمی شوند
  static sensitiveFields = [
    "password",
    "reset_password_token",
    "reset_password_expires",
  ];

  // لیست تمام فیلدها (به جز id و created_at که معمولا توسط دیتابیس مدیریت می شوند در INSERT)
  static allFields = [
    "name",
    "email",
    "password",
    "role",
    "phone",
    "national_id",
    "last_name",
    "avatar_url",
    "date_of_birth",
    "gender",
    "is_active",
    "last_login_at",
    "email_verified_at",
    "phone_verified_at",
    "reset_password_token",
    "reset_password_expires",
  ];

  // لیست فیلدهایی که هنگام SELECT برای فرانت‌اند برمی‌گردند (بدون فیلدهای حساس)
  static publicFields = User.allFields.filter(
    (field) => !User.sensitiveFields.includes(field)
  );

  // این تابع معمولاً برای ادمین است و ممکن است شامل فیلدهای حساس نباشد در اینجا
  static async getAll() {
    const result = await pool.query(
      `SELECT id, created_at, ${User.publicFields.join(", ")} FROM users`
    );
    return result.rows;
  }

  // تابع دریافت کاربر بر اساس ID (برای استفاده عمومی یا نمایش پروفایل خود کاربر)
  static async getById(id) {
    // انتخاب فیلدهای غیرحساس
    const result = await pool.query(
      `SELECT id, created_at, ${User.publicFields.join(
        ", "
      )} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // تابع دریافت کاربر بر اساس ایمیل (برای لاگین - نیاز به پسورد دارد)
  static async findByEmail(email) {
    // انتخاب همه فیلدها شامل password برای لاگین و اعتبارسنجی پسورد
    const result = await pool.query(
      `SELECT id, created_at, ${User.allFields.join(
        ", "
      )} FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  // تابع ایجاد کاربر جدید
  static async create(user) {
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
    } = user; // فیلدهای اولیه در زمان ایجاد

    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required"); // اعتبار سنجی اولیه
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // فقط فیلدهایی که در زمان ایجاد معمولا مقداری می گیرند در کوئری INSERT قرار می گیرند
    const insertFields = [
      "name",
      "email",
      "password",
      "role",
      "phone",
      "national_id",
      "last_name",
      "avatar_url",
      "date_of_birth",
      "gender",
      "is_active",
    ];
    const insertValues = [
      name,
      email,
      hashedPassword,
      role || "user",
      phone || null,
      national_id || null,
      last_name || null,
      avatar_url || null,
      date_of_birth || null,
      gender || null,
      user.is_active !== undefined ? user.is_active : true,
    ];

    // ساخت بخش value string برای کوئری ($1, $2, ...)
    const valuePlaceholders = insertValues
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    const fieldNames = insertFields.join(", ");

    const result = await pool.query(
      `INSERT INTO users (${fieldNames}) VALUES (${valuePlaceholders}) RETURNING id, created_at, ${User.publicFields.join(
        ", "
      )}`, // بازگرداندن فیلدهای غیرحساس
      insertValues
    );
    return result.rows[0];
  }

  // تابع به‌روزرسانی اطلاعات کاربر
  // این تابع به صورت داینامیک فیلدهایی که در object updateData وجود دارند را به‌روز می‌کند
  static async update(id, updateData) {
    const { password, ...fieldsToUpdate } = updateData; // جدا کردن پسورد برای هش کردن

    const values = [];
    const updates = [];
    let paramIndex = 1;

    // لیست تمام فیلدهایی که اجازه به‌روزرسانی آن‌ها از طریق این تابع وجود دارد (به جز پسورد)
    const allowedUpdateFields = [
      "name",
      "email",
      "role",
      "phone",
      "national_id",
      "last_name",
      "avatar_url",
      "date_of_birth",
      "gender",
      "is_active",
      "is_verified",
    ];

    for (const field of allowedUpdateFields) {
 
      if (updateData.hasOwnProperty(field)) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(fieldsToUpdate[field]); // استفاده از مقدار از fieldsToUpdate
      }
    }

    // اضافه کردن پسورد در صورت وجود (با هش کردن)
    if (password !== undefined && password !== null && password !== "") {
      // چک می کند که پسورد برای تغییر فرستاده شده باشد
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    } else {
      // اگر پسورد در updateData وجود نداشت یا خالی بود، آن را به‌روز نمی‌کنیم
      console.log(
        "Password not provided for update, skipping password update."
      );
    }

    if (updates.length === 0) {
      // هیچ فیلدی برای به‌روزرسانی وجود ندارد
      console.warn("No fields to update for user ID:", id);
      const existingUser = await this.getById(id); // واکشی کاربر بدون تغییر و برگرداندن
      return existingUser;
    }

    let query = "UPDATE users SET";
    query += " " + updates.join(", "); // چسباندن بخش های کوئری
    query += ` WHERE id = $${paramIndex++} RETURNING id, created_at, ${User.publicFields.join(
      ", "
    )}`; // شرط WHERE و بازگرداندن فیلدهای غیرحساس
    values.push(id); // اضافه کردن ID کاربر به انتهای مقادیر

  

    const result = await pool.query(query, values);
    return result.rows[0]; 
  }

  static async delete(id) {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  }


  static async updateLastLogin(userId) {
    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [
      userId,
    ]);
  }

  static async markEmailAsVerified(userId) {
    await pool.query(
      "UPDATE users SET email_verified_at = NOW() WHERE id = $1",
      [userId]
    );
  }

  static async setResetPasswordToken(userId, token, expiresAt) {
    await pool.query(
      "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3",
      [token, expiresAt, userId]
    );
  }

  static async findByResetPasswordToken(token) {
   
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
      [token]
    );
    return result.rows[0];
  }

  static async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
  
    await pool.query(
      "UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE id = $2",
      [hashedPassword, userId]
    );
  }
}

module.exports = User;
