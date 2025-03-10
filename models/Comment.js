// models/Comment.js
const pool = require("../config/db");

class Comment {
  static async getAll() {
    const result = await pool.query("SELECT * FROM comments");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM comments WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async create(comment) {
    const { user_id, product_id, rating, text, response } = comment;
    const result = await pool.query(
      "INSERT INTO comments (user_id, product_id, rating, text, response) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user_id, product_id, rating, text, response]
    );
    return result.rows[0];
  }

  static async update(id, comment) {
    const { user_id, product_id, rating, text, response } = comment;
    const result = await pool.query(
      "UPDATE comments SET user_id = $1, product_id = $2, rating = $3, text = $4, response = $5 WHERE id = $6 RETURNING *",
      [user_id, product_id, rating, text, response, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM comments WHERE id = $1", [id]);
  }
}

module.exports = Comment;
