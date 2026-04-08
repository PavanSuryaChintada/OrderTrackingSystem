const { Pool } = require("pg");
const env = require("../config/env");

function poolOptions() {
  const url = env.databaseUrl;
  const options = {
    connectionString: url,
  };

  if (process.env.VERCEL) {
    options.max = 1;
    // Vercel → Supabase TLS: always relax verification (fixes "self-signed certificate in chain")
    options.ssl = { rejectUnauthorized: false };
    return options;
  }

  const isRemote = !/127\.0\.0\.1|localhost/i.test(url);
  const hasSslHint = /supabase\.co|pooler\.supabase|sslmode=require/i.test(url);
  if (isRemote || hasSslHint) {
    options.ssl = { rejectUnauthorized: false };
  }

  return options;
}

const pool = new Pool(poolOptions());

module.exports = pool;
