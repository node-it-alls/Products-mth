const fs = require('fs');
const readline = require('readline');
const mysql = require('mysql2');
const csv = require('csv-parser');
const Papa = require("papaparse");
const { promisify } = require('util');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'Products',
  connectionLimit: 1000,
});

//////////////////////////////////////////////////////////////////////////////////////////
//const tableName = 'features'
//const tableName = 'photos';
//const tableName = 'products';
//const tableName = 'related';
//const tableName = 'skus';
//const tableName = 'styles';
//const fileName = `${tableName}.csv`;
//const fields = ['id','product_id','feature','value'];//features
//const fields = ['id','style_id','url','thumbnail_url'];//photos
//const fields = ['id','name','slogan','description','category','default_price']//products
//const fields = ['id','product_id','related_id']// related
//const fields = ['id','style_id','size','quantity']//skus
//const fields =['id','product_id','name','sale_price','original_price','default_style']//styles
const allTables=[
  ['features',['id','product_id','feature','value']],
   ['photos',['id','style_id','url','thumbnail_url']],
   ['products',['id','name','slogan','description','category','default_price']],
   ['related',['id','product_id','related_id']],
   ['skus',['id','style_id','size','quantity']],
   ['styles',['id','product_id','name','sale_price','original_price','default_style']]
]
///////////////////////////////////////////////////////////////////////////////////////////
const BATCH_SIZE = 50000;
let insertCount =0;

let batch = {};
async function processLineByLine(nameFields) {

  const [tableName,fields] = nameFields;
  const fileName = `${tableName}.csv`;
  const fileStream = fs.createReadStream(fileName);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  batch[tableName]=new Array();
  let count =0;
  for await (const line of rl) {
    if(count === 0){//skip first line
      count++;
      continue;
    }
    let inputs = Papa.parse(line).data[0];
    //if(tableName==='styles')
    inputs=inputs.map(x=>x==='null'?null:x);
    //console.log(inputs);
    batch[tableName].push(inputs);
    if(batch[tableName].length===BATCH_SIZE){
      await insertBatch(tableName,fields)
    }

  }
  await insertBatch(tableName,fields)
  console.log('done');
}
async function insertBatch(tableName,fields) {

  const query = `REPLACE INTO ${tableName} (${fields.join(',')}) VALUES ?`;
  const queryPromise = promisify(pool.query).bind(pool);
  //const executePromise = promisify(pool.execute).bind(pool);

  try {
      await queryPromise(query, [batch[tableName]]);
      //await executePromise(query,[batch[tableName]]);
      console.log(`Inserted batch of ${batch[tableName].length} records.`);
  } catch (err) {
      console.error('Error inserting batch:', err);
  } finally {
      batch[tableName] = []; // Clear the batch for the next set of records

  }
}

let go=async()=>await allTables.forEach(table=> processLineByLine(table))
go();

process.on('exit', () => {
  pool.end();
});