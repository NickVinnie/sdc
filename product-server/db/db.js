const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: `sdcc432!`,
  database: 'products',
  host: '3.15.240.241',
  port: 5432,
});

module.exports = { pool };
