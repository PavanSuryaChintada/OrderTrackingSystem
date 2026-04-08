const { Pool } = require("pg");
const env = require("../config/env");

function poolOptions() {
  const url = env.databaseUrl;
  const isRemote = !/127\.0\.0\.1|localhost/i.test(url);
  const hasSslHint = /supabase\.co|pooler\.supabase|sslmode=require/i.test(url);
  const options = {
    connectionString: url,
  };

  if (process.env.VERCEL) {
    options.max = 1;
  }

  if (isRemote || hasSslHint) {
    options.ssl = { rejectUnauthorized: false };
  }

  return options;
}

const pool = new Pool(poolOptions());

module.exports = pool;
