// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'devuser',
  host: 'localhost',
  database: 'housemaster',
  password: 'devpass',
  port: 5432,
});

module.exports = pool;