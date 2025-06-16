const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432,
});

async function insertSize() {
  try {
    await client.connect();

    const sizes = [
      { size: "L", type: "لباس" },
      { size: "XL", type: "لباس" },
      { size: "XXL", type: "لباس" },
      { size: "36", type: "کفش" },
      { size: "37", type: "کفش" },
      { size: "38", type: "کفش" },
      { size: "39", type: "کفش" },
      { size: "40", type: "کفش" },
    ];

    for (const size of sizes) {
      await client.query(
        "INSERT INTO sizes (size, type) VALUES ($1, $2) RETURNING *",
        [size.size, size.type]
      );
   
    }


  } catch (error) {
    console.error("Error inserting sizes:", error);
  } finally {
    await client.end();
  }
}

insertSize();
