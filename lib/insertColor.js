const { Client } = require("pg");

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "my_next_auth_db",
  password: "123",
  port: 5432,
});

async function insertColors() {
  try {
    await client.connect();

    const colors = [
      { name: "قرمز", code: "#FF0000" },
      { name: "آبی", code: "#0000FF" },
      { name: "سبز", code: "#008000" },
      { name: "زرد", code: "#FFFF00" },
      { name: "مشکی", code: "#000000" },
      { name: "سفید", code: "#FFFFFF" },
      { name: "خاکستری", code: "#808080" },
      { name: "نارنجی", code: "#FFA500" },
      { name: "بنفش", code: "#800080" },
      { name: "صورتی", code: "#FFC0CB" },
    ];

    for (const color of colors) {
      await client.query(
        "INSERT INTO colors (name, code) VALUES ($1, $2) RETURNING *",
        [color.name, color.code]
      );

    }


  } catch (error) {
    console.error("Error inserting colors:", error);
  } finally {
    await client.end();
  }
}

insertColors();
