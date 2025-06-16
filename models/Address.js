// models/Address.js
const pool = require("../config/db");

class Address {
  static async setDefaultAddress(addressId, userId) {
    // ابتدا تمام آدرس‌های کاربر را از حالت پیش‌فرض خارج کنید
    await pool.query(
      "UPDATE addresses SET is_default = false WHERE user_id = $1",
      [userId]
    );

    // سپس آدرس جدید را به عنوان پیش‌فرض تنظیم کنید
    const result = await pool.query(
      "UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *",
      [addressId, userId]
    );

    return result.rows[0]; // آدرس پیش‌فرض جدید برمی‌گردد
  }
  // static async getAll() {
  //   const result = await pool.query("SELECT * FROM addresses");
  //   return result.rows;
  // }
  static async getAll(userId) {
    const result = await pool.query(
      `
    SELECT a.*, 
           p.name AS province_name, 
           c.name AS city_name
    FROM addresses a
    JOIN provinces p ON a.province_id = p.id
    JOIN cities c ON a.city_id = c.id
    WHERE a.user_id = $1
  `,
      [userId]
    );
    return result.rows;
  }
  static async getById(id) {
    const result = await pool.query("SELECT * FROM addresses WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(address) {
    const {
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
    } = address;
    
  if (!user_id || !province_id || !city_id || !full_address || !tel) {
    throw new Error("تمام فیلدهای ضروری باید پر شوند.");
  }
    const result = await pool.query(
      "INSERT INTO addresses (province_id, city_id, full_address, building_num, unit_num, zip_code, tel , user_id, reciever ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        province_id,
        city_id,
        full_address,
        building_num,
        unit_num,
        zip_code,
        tel,
        user_id,
        reciever,
      ]
    );
    return result.rows[0];
  }

  static async update(id,userId, address) {
    const {
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
      reciever,
    } = address;
     if (!province_id || !city_id || !full_address || !tel) {
       throw new Error("تمام فیلدهای ضروری باید پر شوند.");
     }
    const result = await pool.query(
      "UPDATE addresses SET province_id = $1, city_id = $2, full_address = $3, building_num = $4, unit_num = $5, zip_code = $6, tel = $7, reciever = $8 WHERE id = $9 AND user_id = $10 RETURNING *",
      [
        province_id,
        city_id,
        full_address,
        building_num,
        unit_num,
        zip_code,
        tel,
        reciever,
        id,
        userId,
      ]
    );
    return result.rows[0];
  }

  static async delete(id,userId) {
    const result = await pool.query(
      "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    ); // استفاده از userId و RETURNING برای اطلاع از حذف موفق
    return result.rowCount;
  }
}

module.exports = Address;
