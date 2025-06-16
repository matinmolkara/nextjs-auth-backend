// models/Product.js
const pool = require("../config/db");

class Product {
  static async getAll() {
    const result = await pool.query("SELECT * FROM products");
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  }

  static async getByCategoryId(categoryId) {
    // پیاده‌سازی کوئری بر اساس ساختار دیتابیس شما (یک به چند یا چند به چند)
    // مثال برای رابطه یک به چند (ستون category_id در جدول products):
    const query = "SELECT * FROM products WHERE category_id = $1";
    const values = [categoryId];
    const result = await pool.query(query, values); // استفاده از pool.query
    return result.rows;
  }

  static async getByBrandId(brandId) {
    const query = "SELECT * FROM products WHERE brand_id = $1";
    const values = [brandId];
    const result = await pool.query(query, values); // استفاده از pool.query
    return result.rows;
  }
  static async create(product) {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
      best_seller,
      has_color,
      has_size,
      inventory,
    } = product;
    const result = await pool.query(
      "INSERT INTO products (title, description, price, real_price, discount, image_urls, category_id, brand_id, special_offer, best_seller,has_color, has_size, inventory) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
        best_seller,
        has_color,
        has_size,
        inventory,
      ]
    );
    return result.rows[0];
  }

  static async update(id, product) {
    const {
      title,
      description,
      price,
      real_price,
      discount,
      image_urls,
      category_id,
      brand_id,
      special_offer,
      best_seller,
      has_color,
      has_size,
      inventory,
    } = product;
    const result = await pool.query(
      "UPDATE products SET title = $1, description = $2, price = $3, real_price = $4, discount = $5, image_urls = $6, category_id = $7, brand_id = $8, special_offer = $9, best_seller = $10, has_color = $11, has_size = $12, inventory= $13  WHERE id = $14 RETURNING *",
      [
        title,
        description,
        price,
        real_price,
        discount,
        image_urls,
        category_id,
        brand_id,
        special_offer,
        best_seller,
        has_color,
        has_size,
        inventory,
        id,
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
  }

  static async getProductAttributes(productId) {
    const res = await pool.query(
      `SELECT ak.name, av.value
     FROM attribute_values av
     JOIN attribute_keys ak ON av.attribute_id = ak.id
     WHERE av.product_id = $1`,
      [productId]
    );
    return res.rows;
  }

  static async getGeneralDescriptions(productId) {
    const res = await pool.query(
      "SELECT title, content FROM product_general_descriptions WHERE product_id = $1",
      [productId]
    );
    return res.rows;
  }

  static async decreaseInventory(productId, quantity) {
    const res = await pool.query(
      `UPDATE products
     SET inventory = inventory - $1
     WHERE id = $2 AND inventory >= $1
     RETURNING *`,
      [quantity, productId]
    );
    return res.rows[0];
  }

  static async increaseInventory(productId, quantity) {
    const res = await pool.query(
      `UPDATE products
     SET inventory = inventory + $1
     WHERE id = $2
     RETURNING *`,
      [quantity, productId]
    );
    return res.rows[0];
  }
  // شمارش کل محصولات (با یا بدون جستجو)
  static async countAll(search = "") {
    const result = await pool.query(
      "SELECT COUNT(*) FROM products WHERE title ILIKE $1",
      [`%${search}%`]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // گرفتن لیست محصولات با صفحه‌بندی و جستجو
  static async getAll(search = "", skip = 0, limit = 15) {
    const result = await pool.query(
      "SELECT * FROM products WHERE title ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3",
      [`%${search}%`, limit, skip]
    );
    return result.rows;
  }

  // شمارش محصولات در دسته‌بندی خاص با جستجو
  static async countByCategoryId(categoryId, search = "") {
    const result = await pool.query(
      "SELECT COUNT(*) FROM products WHERE category_id = $1 AND title ILIKE $2",
      [categoryId, `%${search}%`]
    );
    return parseInt(result.rows[0].count, 10);
  }

  // گرفتن محصولات یک دسته خاص با جستجو و صفحه‌بندی
  static async getByCategoryId(categoryId, search = "", skip = 0, limit = 15) {
    const result = await pool.query(
      "SELECT * FROM products WHERE category_id = $1 AND title ILIKE $2 ORDER BY id DESC LIMIT $3 OFFSET $4",
      [categoryId, `%${search}%`, limit, skip]
    );
    return result.rows;
  }

  static async getByFilters({
    categoryId,
    brand,
    available,
    specialOffer,
    search = "",
    skip = 0,
    limit = 15,
  }) {
    let query = "SELECT * FROM products WHERE title ILIKE $1";
    const values = [`%${search}%`];
    let idx = 2;

    if (categoryId) {
      query += ` AND category_id = $${idx++}`;
      values.push(categoryId);
    }
    if (brand) {
      query += ` AND brand_id = $${idx++}`;
      values.push(brand);
    }
    if (available !== undefined) {
      query += ` AND inventory ${available === "1" ? "> 0" : "= 0"}`; // اصلاح شد
    }
    if (specialOffer === "true") {
      query += ` AND special_offer = true`; // به جای discount
    }

    query += ` ORDER BY id DESC LIMIT $${idx++} OFFSET $${idx++}`;
    values.push(limit, skip);

    const result = await pool.query(query, values);



    return result.rows;
  }

  static async countByFilters({
    categoryId,
    brand,
    available,
    specialOffer,
    search = "",
  }) {
    let query = "SELECT COUNT(*) FROM products WHERE title ILIKE $1";
    const values = [`%${search}%`];
    let idx = 2;

    if (categoryId) {
      query += ` AND category_id = $${idx++}`;
      values.push(categoryId);
    }
    if (brand) {
      query += ` AND brand_id = $${idx++}`;
      values.push(brand);
    }
    if (available !== undefined) {
      query += ` AND inventory ${available === "1" ? "> 0" : "= 0"}`; // اصلاح شد
    }
    if (specialOffer === "true") {
      query += ` AND special_offer = true`; // به جای discount
    }

    const result = await pool.query(query, values);
   

    return parseInt(result.rows[0].count, 10);
    
  }
}





module.exports = Product;
