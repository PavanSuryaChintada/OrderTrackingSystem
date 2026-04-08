const dotenv = require("dotenv");

dotenv.config();

function isLocalDatabaseUrl(url) {
  return /127\.0\.0\.1|localhost/i.test(url);
}

function normalizePostgresUrl(url) {
  return url.replace(/^postgres:\/\//, "postgresql://");
}

function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ].filter(Boolean);

  if (candidates.length === 0) {
    return "";
  }

  const onVercel = Boolean(process.env.VERCEL);

  if (onVercel) {
    const remote = candidates.find((u) => !isLocalDatabaseUrl(u));
    if (remote) {
      return normalizePostgresUrl(remote);
    }
  }

  return normalizePostgresUrl(candidates[0]);
}

const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: resolveDatabaseUrl(),
};

if (!env.databaseUrl) {
  throw new Error(
    "Database URL is required. Set DATABASE_URL or POSTGRES_URL (e.g. from Supabase / Vercel) in your .env file."
  );
}

if (process.env.VERCEL && isLocalDatabaseUrl(env.databaseUrl)) {
  throw new Error(
    "DATABASE_URL on Vercel points to localhost. Remove it or set POSTGRES_URL to your Supabase connection string in Project Settings → Environment Variables."
  );
}

module.exports = env;
