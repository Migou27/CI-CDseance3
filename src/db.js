const { Pool } = require('pg');
const { createClient } = require('redis');

// Configuration PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Configuration Redis
const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));

// Connexion initiale à Redis
(async () => {
  await redis.connect().catch(console.error);
})();

module.exports = { pool, redis };