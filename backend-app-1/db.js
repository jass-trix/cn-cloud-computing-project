// db.js
require('dotenv').config();
const { Pool } = require('pg');
const ps = require('./parameter-store.js');

let poolInstance;

const createPool = () => {
  if (!poolInstance) {
    const { username, password } = ps.getDatabaseCredentials();
    poolInstance = new Pool({
      user: username || process.env.DATABASE_USER,
      host: process.env.DATABASE_URL,
      database: process.env.DATABASE_NAME,
      password: process.NODE_ENV === 'production' ? password : process.env.DATABASE_PASSWORD,
      port: 5432,
      ssl: process.env.NODE_ENV === 'production',
    });
  }

  return poolInstance;
};

module.exports = {
  createPool,
};
