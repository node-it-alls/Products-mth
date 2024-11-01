const mysql = require('mysql2');
const { promisify } = require('util');
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 100,
});
//LOAD DATA LOCAL INFILE ${filepath}
async function batchLoad() {

  const query = `LOAD DATA  INFILE 'photos.csv' INTO TABLE photos`;
  const queryPromise = promisify(pool.query).bind(pool);

  try {
      await queryPromise(query);
      console.log(`Inserted batch of records.`);
  } catch (err) {
      console.error('Error inserting batch:', err);
  } finally {
      batch = []; // Clear the batch for the next set of records

  }
}


batchLoad();
process.on('exit', () => {
  pool.end();
});