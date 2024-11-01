//const tableName = 'features'
//const tableName = 'photos';
const tableName = 'products';
//const tableName = 'related';
//const tableName = 'skus';
//const tableName = 'styles';
const fileName = `${tableName}.csv`;
//const fields = ['id','product_id','feature','value'];//features
//const fields = ['id','style_id','url','thumbnail_url'];//photos
const fields = ['id','name','slogan','description','category','default_price']//products
//const fields = ['id','product_id','related_id']// related
//const fields = ['id','style_id','size','quantity']//skus
//const fields =['id','product_id','name','sale_price','original_price','default_style']//styles

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

const BATCH_SIZE = 1; // Number of records to insert in each batch
const MAX_CONCURRENT_INSERTS = 1; // Max concurrent insert operations

let batch = [];
let activeInserts = 0; // Track active insert operations
// Function to seed data from CSV
function seedDatabase() {
    const stream = fs.createReadStream(fileName)
        .pipe(csv());

    stream.on('data', (row) => {
      batch.push(Object.values(row));
        //batch.push([row.id, row.style_id, row.size,row.quantity]);
        if (batch.length === BATCH_SIZE) {
          let newBatch = batch.slice()  ;
          insertBatch(newBatch);
          batch=[];
        }
    });

    stream.on('end', () => {
        if (batch.length > 0) {
          let newBatch = batch.slice()  ;
          insertBatch(newBatch);
          batch=[];
        }
        console.log('done reading files');
    });

    stream.on('error', (err) => {
        console.error('Error reading CSV file:', err);
    });
}

// Function to insert the current batch into the database
async function insertBatch(newBatch) {
    if (activeInserts >= MAX_CONCURRENT_INSERTS) {
        return; // Limit concurrent inserts
    }

    activeInserts++;

    const query = `REPLACE INTO ${tableName} (${fields.join(",")}) VALUES ?`;
    const queryPromise = promisify(pool.query).bind(pool);

    try {
        await queryPromise(query, [newBatch]);
        console.log(`Inserted batch of ${newBatch.length} records.`);
    } catch (err) {
        console.error('Error inserting batch:', err);
    } finally {
        activeInserts--;
        //batch = [];
    }
}

seedDatabase();


process.on('exit', () => {
    pool.end();
    console.log('...closing');
});
