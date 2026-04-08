const fs = require("fs/promises");
const path = require("path");
const pool = require("../src/db/pool");

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, "..", "sql", "init.sql");
    const sql = await fs.readFile(sqlPath, "utf8");
    await pool.query(sql);
    console.log("Database initialized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  }
}

initDb();
