// models/Page.js
const pool = require("../config/db");

class Page {
  static async getAll() {
    const result = await pool.query(
      "SELECT * FROM pages ORDER BY updated_at DESC"
    );
    return result.rows;
  }

  static async getBySlug(slug) {
    const result = await pool.query("SELECT * FROM pages WHERE slug = $1", [
      slug,
    ]);
    return result.rows[0] || null;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM pages WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  static async create({ slug, title, content, published }) {
    const result = await pool.query(
      `INSERT INTO pages (slug, title, content, published)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [slug, title, content, published]
    );
    return result.rows[0];
  }

  static async update(id, { slug, title, content, published }) {
    const result = await pool.query(
      `UPDATE pages
       SET slug = $1, title = $2, content = $3, published = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [slug, title, content, published, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM pages WHERE id = $1", [id]);
  }
}

module.exports = Page;
