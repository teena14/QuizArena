const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('DELETE FROM quizzes WHERE "deletedAt" IS NOT NULL')
  .then(res => {
    console.log(`Deleted ${res.rowCount} soft-deleted quizzes.`);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
