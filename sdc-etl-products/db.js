const pw = require('./dbpw.js');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: `${pw}`,
  database: 'products',
  host: 'localhost',
  port: 5432,
});

module.exports = { pool };