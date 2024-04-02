// data.js

const db = require('./db');

const getAllData = async () => {
  try {
    const pool = db.createPool();
    const result = await pool.query('SELECT * FROM items');
    return result.rows;
  } catch (error) {
    console.error('Error retrieving data:', error);
    throw error;
  }
};

module.exports = {
  getAllData,
};
