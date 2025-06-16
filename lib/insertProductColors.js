const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432,
});

async function insertProductColors() {
  try {
    await client.connect();

    // مثال داده‌های محصولات و رنگ‌ها
    const productColorsData = [
      { productId: 5, colorIds: [1, 2, 4] }, // محصول 1: قرمز، آبی، زرد
      { productId: 2, colorIds: [3, 5] }, // محصول 2: سبز، مشکی
      { productId: 3, colorIds: [6, 8, 10] }, // محصول 3: سفید، نارنجی، صورتی
      { productId: 4, colorIds: [2, 7, 9] }, // محصول 4: آبی، خاکستری، بنفش
    ];

    for (const item of productColorsData) {
      for (const colorId of item.colorIds) {
        await client.query(
          "INSERT INTO product_colors (product_id, color_id) VALUES ($1, $2)",
          [item.productId, colorId]
        );
      
      }
    }


  } catch (error) {
    console.error("Error inserting product colors:", error);
  } finally {
    await client.end();
  }
}

insertProductColors();
