// models/User.js
const pool = require("../config/db");
const bcrypt = require("bcryptjs");

class User {
  static async getAll() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }

  static async create(user) {
    const { name, email, password, role } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, role || "user"]
    );
    return result.rows[0];
  }

  static async update(id, user) {
    const { name, email, password, role } = user;
    let updateQuery = "UPDATE users SET name = $1, email = $2, role = $3";
    let values = [name, email, role || "user"];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = $" + (values.length + 1);
      values.push(hashedPassword);
    }

    updateQuery += " WHERE id = $" + (values.length + 1) + " RETURNING *";
    values.push(id);

    const result = await pool.query(updateQuery, values);
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  }

  static async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  }
}

module.exports = User;
