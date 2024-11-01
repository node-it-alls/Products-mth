const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');
const { promisify } = require('util');

const tableName = 'photos';
const fileName = `${tableName}.csv`;

const fields = ['id','style_id','url','thumbnail_url'];

require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 100,
});

const BATCH_SIZE = 1; // Number of records to insert in each batch
const MAX_CONCURRENT_INSERTS = 10000; // Max concurrent insert operations

let batch = [];
let activeInserts = 0; // Track active insert operations

// Function to seed data from CSV
function seedDatabase() {
    const stream = fs.createReadStream('photos.csv')
        .pipe(csv());

    stream.on('data', (row) => {
        batch.push([row.id, row.style_id, row.url,row.thumbnail_url]);

        // If the batch size is reached, insert the batch
        if (batch.length === BATCH_SIZE) {
            insertBatch(stream);
        }
    });

    stream.on('end', () => {
        // Insert any remaining records in the batch
        if (batch.length > 0) {
            insertBatch(stream);
        }
    });

    stream.on('error', (err) => {
        console.error('Error reading CSV file:', err);
    });
}

// Function to insert the current batch into the database
async function insertBatch(stream) {
    if (activeInserts >= MAX_CONCURRENT_INSERTS) {
      stream.pause()
        return; // Limit concurrent inserts
    }

    activeInserts++;

    const query = 'INSERT INTO photos (id,style_id,url,thumbnail_url) VALUES ?';
    const queryPromise = promisify(pool.query).bind(pool);

    try {
        await queryPromise(query, [batch]);
        console.log(`Inserted batch of ${batch.length} records.`);
    } catch (err) {
        console.error('Error inserting batch:', err);
    } finally {
        activeInserts--;
        batch = []; // Clear the batch for the next set of records
        stream.resume();
    }
}

// Start the seeding process
seedDatabase();

// Close the pool after all writes are done
process.on('exit', () => {
    pool.end();
});