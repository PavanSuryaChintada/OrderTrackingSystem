const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || "",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required. Add it to your .env file.");
}

module.exports = env;
