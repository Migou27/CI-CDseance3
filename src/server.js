const express = require('express');
const { pool, redis } = require('./db');
const tasksRoutes = require('./routes/tasks');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes API
app.use('/api/tasks', tasksRoutes);

// Endpoint /health attendu par le CTO
app.get('/health', async (req, res) => {
  const health = { status: 'healthy', timestamp: new Date().toISOString() };

  try {
    // Test connexion PostgreSQL
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (e) {
    health.status = 'unhealthy';
    health.database = 'disconnected';
  }

  try {
    // Test connexion Redis
    await redis.ping();
    health.cache = 'connected';
  } catch (e) {
    health.status = 'unhealthy';
    health.cache = 'disconnected';
  }

  const code = health.status === 'healthy' ? 200 : 503;
  res.status(code).json(health);
});

app.listen(port, () => {
  console.log(`Serveur API démarré sur le port ${port}`);
});