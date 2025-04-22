const pool = require("./config/db");

const syncProductFlags = async () => {
  await pool.query(`ALTER TABLE products
    ADD COLUMN IF NOT EXISTS has_color BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS has_size BOOLEAN DEFAULT false;
  `);

  await pool.query(`
    UPDATE products
    SET has_color = true
    WHERE id IN (SELECT DISTINCT product_id FROM product_colors);
  `);

  await pool.query(`
    UPDATE products
    SET has_size = true
    WHERE id IN (SELECT DISTINCT product_id FROM product_sizes);
  `);

  console.log("🟢 ستون‌های has_color و has_size با موفقیت به‌روزرسانی شدند.");
  process.exit();
};

syncProductFlags().catch((err) => {
  console.error("❌ خطا در بروزرسانی ستون‌ها:", err);
  process.exit(1);
});
