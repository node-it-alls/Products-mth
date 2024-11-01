const fs = require('fs');
const mysql = require('mysql2');
const csv = require('csv-parser');
const { promisify } = require('util');

require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 100,
});

const BATCH_SIZE = 50000; // Number of records to insert in each batch
const MAX_CONCURRENT_INSERTS = 50; // Max concurrent insert operations

let batch = [];
let activeInserts = 0; // Track active insert operations
//let second = []
// Function to seed data from CSV
function seedDatabase() {
    const stream = fs.createReadStream('skus.csv')
        .pipe(csv());

    stream.on('data', (row) => {
      batch.push(Object.values(row));
        //batch.push([row.id, row.style_id, row.size,row.quantity]);
        //second.push([row.id, row.style_id, row.size,row.quantity]);

        // If the batch size is reached, insert the batch
        if (batch.length >= BATCH_SIZE) {
            insertBatch();
        }
    });

    stream.on('end', () => {
        // Insert any remaining records in the batch
        if (batch.length > 0) {
            insertBatch();
        }
        console.log('done');
    });

    stream.on('error', (err) => {
        console.error('Error reading CSV file:', err);
    });
    //console.log('done');
}

// Function to insert the current batch into the database
async function insertBatch() {
    if (activeInserts >= MAX_CONCURRENT_INSERTS) {
        return; // Limit concurrent inserts
    }

    activeInserts++;

    const query = 'REPLACE INTO skus (id, style_id, size,quantity) VALUES ?';
    const queryPromise = promisify(pool.query).bind(pool);

    try {
        await queryPromise(query, [batch]);
        console.log(`Inserted batch of ${batch.length} records.`);
    } catch (err) {
        console.error('Error inserting batch:', err);
    } finally {
        activeInserts--;
        batch = []; // Clear the batch for the next set of records
    }
}

// Start the seeding process
seedDatabase();

// Close the pool after all writes are done
process.on('exit', () => {
    pool.end();
});
//[id,style,photosID]    [photosID,url,thumbnail]
//[id,style,Allphotos[photosID]]                      let allPhotos=  {id:[url,thumbnail],id:[url,thumbnail]}
//10000                      10000