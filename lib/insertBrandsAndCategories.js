const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432,
});

async function insertBrandsAndCategories() {
  try {
    await client.connect();

    // درج برندها
    const brands = [
      { id: 5, name: "ELENA" },
      { id: 6, name: "Versace" },
      { id: 11, name: "Classic" },
      { id: 12, name: "Infinity" },
      { id: 13, name: "Runner" },
      { id: 14, name: "Police" },
      { id: 15, name: "PRO-HIKER" },
      { id: 16, name: "Spartan" },
    ];

    for (const brand of brands) {
      await client.query("INSERT INTO brands (id, name) VALUES ($1, $2)", [
        brand.id,
        brand.name,
      ]);

    }

    // درج دسته‌بندی‌ها
    const categories = [
      { id: 1, name: "اکسسوری", parent_id: null },
      { id: 2, name: "کمربند و ساسبند", parent_id: 1 },
      { id: 3, name: "کمربند", parent_id: 2 },
      { id: 4, name: "کفش", parent_id: null },
      { id: 5, name: "کفش چرم", parent_id: 4 },
      { id: 6, name: "کفش مردانه", parent_id: 5 },
    ];
    for (const category of categories) {
      await client.query(
        "INSERT INTO categories (id, name, parent_id) VALUES ($1, $2, $3)",
        [category.id, category.name, category.parent_id]
      );
    }

  } catch (error) {
    console.error("Error inserting brands and categories:", error);
  } finally {
    await client.end();
  }
}

insertBrandsAndCategories();
