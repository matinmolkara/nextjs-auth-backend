// scripts/importProvincesAndCities.js

const fs = require("fs").promises;
const path = require("path");
const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432,
});

async function importData() {
  await client.connect();

  const filePath = path.join(__dirname, "../data/province_city.txt");
  const data = await fs.readFile(filePath, "utf8");
  const provincesData = JSON.parse(data);

  try {
    await client.query("BEGIN");

    for (const provinceEntry of provincesData) {
      const provinceName = provinceEntry.province;

      const provinceRes = await client.query(
        "INSERT INTO provinces (name) VALUES ($1) RETURNING id",
        [provinceName]
      );
      const provinceId = provinceRes.rows[0].id;

      for (const cityName of provinceEntry.cities) {
        await client.query(
          "INSERT INTO cities (name, province_id) VALUES ($1, $2)",
          [cityName, provinceId]
        );
      }
    }

    await client.query("COMMIT");
 
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ خطا در واردسازی داده‌ها:", err.message);
  } finally {
    await client.end();
  }
}

importData();
