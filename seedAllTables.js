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
  database: process.env.DB_NAME,
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
const BATCH_SIZE = 50000;
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

  //const query = `REPLACE INTO ${tableName} (${fields.join(',')}) VALUES ?`;
  //console.log(fields);
  const query = `REPLACE INTO ${tableName} (${fields.join(',')}) VALUES`;
  const vals = batch[tableName]
    .map((x) => {
      return "(" +
        x.map((y, i) => {
          if (y === null)
            return 'NULL'
          else if (!isNaN(y)) {
            if (['sale_price', 'original_price', 'default_price'].includes(fields[i])) {
              return Number(y).toFixed(2);
            }
            return y;
          }
          else
            return "'" + y.replaceAll("'", "\\'") + "'"
        })
          .join(",")
        + ")"
    });

  const queryAndVals = query + vals.join(',');
  const queryPromise = promisify(pool.query).bind(pool);
  try {
    await queryPromise(queryAndVals)
    //queryPromise(query, [batch[tableName]])
    // queryPromise(queryAndVals)
    // .then(r => {
    // console.log(`Inserted batch of ${batch[tableName].length} records.`);
    // delete batch[tableName];
    // batch[tableName] = []; // Clear the batch for the next set of records
    // })
    // .catch(e => console.error('Error inserting batch:', e))
  } catch (e) {
    console.error('Error inserting batch:', e)
  } finally {
    console.log(`Inserted batch of ${batch[tableName].length} records.`);
    delete batch[tableName];
    batch[tableName] = []; // Clear the batch for the next set of records

  }
}

let go = async () => await allTables.forEach(table => processLineByLine(table))
go();

process.on('exit', () => {
  pool.end();
});