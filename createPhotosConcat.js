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
  port: process.env.DB_PORT,
  connectionLimit: 100,
});

///////////////////////////////////////////////////////////////////////////////////////////
let insertCount = 0;

let batch = [];
const BATCH_SIZE = 5000;
let i =1;
async function load() {

  //batch = new Array();
  //let count = 0;
  const queryPromise = promisify(pool.query).bind(pool);
  const query =
    `SELECT
      styles.id AS style_id,
    GROUP_CONCAT(thumbnail_url, ',',url SEPARATOR ',') AS photos
    FROM
      styles
    LEFT JOIN
      photos p ON styles.id = p.style_id
      where styles.id=?
    GROUP BY
      styles.id`;
  const query2 =
    `REPLACE INTO photos_concat( style_id,photos) VALUES(?,?)`;
  try {

    for ( i = 1955001; i <= 1958102; i += BATCH_SIZE) {
      for (let j = 0; j < BATCH_SIZE; j++) {
        batch.push(queryPromise(query, j + i).then(results => {
          const newValues = [results[0]?.style_id, results[0]?.photos];
          if (results[0]?.style_id) {
            queryPromise(query2, newValues);
          }

        }).catch(e => console.log(e)))
      }
      await Promise.all(batch).then(r => {
        console.log("inserted " + BATCH_SIZE + " starting at " + i)
        batch = [];
      }).catch(e => console.log(e))
    }

  } catch (e) {
    console.error('Error inserting batch:', e);

  } finally {
    await Promise.all(batch).then(r => {
      console.log("inserted " + BATCH_SIZE + " starting at " + i)
      batch = [];
    }).catch(e => console.log(e))
    console.log("Done updating tables");
  }
}
load();

process.on('exit', () => {
  pool.end();
});