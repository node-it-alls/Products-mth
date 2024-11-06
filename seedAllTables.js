const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2');
const Papa = require("papaparse");
const { promisify } = require('util');
const path = require('path');
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port:process.env.DB_PORT,
  connectionLimit: 100,
});
const allTables = [
  ['features', ['id', 'product_id', 'feature', 'value']],
  ['photos', ['id', 'style_id', 'url', 'thumbnail_url']],
  ['products', ['id', 'name', 'slogan', 'description', 'category', 'default_price']],
  ['related', ['id', 'product_id', 'related_id']],
  ['skus', ['id', 'style_id', 'size', 'quantity']],
  ['styles', ['id', 'product_id', 'name', 'sale_price', 'original_price', '`default?`']]
]
///////////////////////////////////////////////////////////////////////////////////////////
const BATCH_SIZE = 1000;
let insertCount = 0;

let batch = {};
async function processLineByLine(nameFields) {

  const [tableName, fields] = nameFields;
  const fileName = `${tableName}.csv`;
  const fileStream = fs.createReadStream(path.join(__dirname, 'csvs', fileName));

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  batch[tableName] = new Array();
  let count = 0;
  for await (const line of rl) {
    if (count === 0) {//skip first line
      count++;
      continue;
    }
    let inputs = Papa.parse(line).data[0];
    inputs = inputs.map(x => (x === 'null' || x === 'NULL') ? null : x);
    batch[tableName].push(inputs);
    if (batch[tableName].length === BATCH_SIZE) {
      await insertBatch(tableName, fields)
    }

  }
  await insertBatch(tableName, fields)
  console.log('done');
}
async function insertBatch(tableName, fields) {
  const query = `REPLACE INTO ${tableName} (${fields.join(',')}) VALUES`;
  const vals = batch[tableName]
    .map((record) => {
      return "(" +
        record.map((element, i) => {
          if (element === null)
            return 'NULL'
          else if (!isNaN(element)) {
            if (['sale_price', 'original_price', 'default_price'].includes(fields[i])) {
              return Number(element).toFixed(2);
            }
            return element;
          }
          else
            return "'" + element.replaceAll("'", "\\'") + "'"
        })
          .join(",")
        + ")"
    });

  const queryAndVals = query + vals.join(',');
  const queryPromise = promisify(pool.query).bind(pool);
  try {
    await queryPromise(queryAndVals);
    console.log(`Inserted batch of ${batch[tableName].length} records.`);

  } catch (e) {
    console.error('Error inserting batch:', e);
  } finally {
    delete batch[tableName];
    batch[tableName] = []; // Clear the batch for the next set of records

  }
}

const  loadAllTables = async () => await allTables.forEach(table => processLineByLine(table))
loadAllTables();

process.on('exit', () => {
  pool.end();
});