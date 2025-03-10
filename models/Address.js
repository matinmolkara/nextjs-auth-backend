// models/Address.js
const pool = require("../config/db");

class Address {
  static async getAll() {
    const result = await pool.query("SELECT * FROM addresses");
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
    } = address;
    const result = await pool.query(
      "INSERT INTO addresses (user_id, province_id, city_id, full_address, building_num, unit_num, zip_code, tel) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        user_id,
        province_id,
        city_id,
        full_address,
        building_num,
        unit_num,
        zip_code,
        tel,
      ]
    );
    return result.rows[0];
  }

  static async update(id, address) {
    const {
      user_id,
      province_id,
      city_id,
      full_address,
      building_num,
      unit_num,
      zip_code,
      tel,
    } = address;
    const result = await pool.query(
      "UPDATE addresses SET user_id = $1, province_id = $2, city_id = $3, full_address = $4, building_num = $5, unit_num = $6, zip_code = $7, tel = $8 WHERE id = $9 RETURNING *",
      [
        user_id,
        province_id,
        city_id,
        full_address,
        building_num,
        unit_num,
        zip_code,
        tel,
        id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM addresses WHERE id = $1", [id]);
  }
}

module.exports = Address;
