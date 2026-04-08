const { Pool } = require("pg");
const env = require("../config/env");

function poolOptions() {
  const url = env.databaseUrl;
  const options = {
    connectionString: url,
  };

  if (process.env.VERCEL) {
    options.max = 1;
  }

  if (/supabase\.co|pooler\.supabase|sslmode=require/i.test(url)) {
    options.ssl = { rejectUnauthorized: false };
  }

  return options;
}

const pool = new Pool(poolOptions());

module.exports = pool;
