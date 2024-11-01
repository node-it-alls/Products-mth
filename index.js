const express = require('express');
const { promisify } = require('util');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  connectionLimit: 100,
});

const queryPromise = promisify(pool.query).bind(pool);

app.get('/', (req, res) => {
  let page = Number(req.query.page) || 1;
  let count = Number(req.query.count) || 5;
  if (page < 1 || page % 1 !== 0)
    return res.status(400).send("Invalid Page");
  if (count < 1 || count % 1 !== 0 || count > 20000)
    return res.status(400).send("Invalid count");
  const query = 'SELECT * FROM products LIMIT ? OFFSET ?'
  queryPromise(query, [count, count * (page - 1)])
    .then(results => {
      res.send(results)
      }
    )
    .catch(e => console.log(e))
})
/*app.get('/:id/styles', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  //SKU AND PHOTOS join on style_id
  const query1 = 'SELECT * from styles st join photos p on st.id=p.style_id where product_id=? ;'
  const query2 = 'SELECT * from styles st join skus s on st.id=s.style_id where product_id=? ;'
  //queryPromise(query1, [id])
  Promise.all([queryPromise(query1, [id]), queryPromise(query2, [id])])
    .then(results => {
      let output = {};

      res.send(results);
    })
    .catch(e => console.log(e))
});*/

app.get('/:id/styles', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  //SKU AND PHOTOS join skus s
  const query1 = "SELECT st.id,name,original_price,sale_price,default_style,GROUP_CONCAT(thumbnail_url SEPARATOR ',') as thumbnails,GROUP_CONCAT(url SEPARATOR ',') as photos from styles st join photos p on st.id=p.style_id where product_id=? GROUP BY style_id;"
  const query2 = 'SELECT st.id as styles_id,s.id as sku_id,size,quantity from styles st join skus s on st.id=s.style_id where product_id=? ;'
  //queryPromise(query1, [id])
  Promise.all([queryPromise(query1, [id]), queryPromise(query2, [id])])
    .then(results => {
      const output = {product_id:id,results:[]};
      const styles ={}
      results[0].forEach(result=>{
        const {id,style_id,name,original_price,sale_price,default_style}=result;
        styles[id]={style_id:id,name,original_price:original_price+".00",sale_price,'default?':!!default_style};
        const thumbnails =result.thumbnails.split(',');
        const urls=result.photos.split(',');
        const photos =thumbnails.map((thumbnail_url,i)=>({thumbnail_url,url:urls[i]}));
        styles[id].photos=photos;
        styles[id].skus={};
      });
      results[1].forEach(result=>{
        const {sku_id,styles_id,size,quantity}=result;
        styles[styles_id]['skus'][sku_id]={quantity,size};
      });
      output.results=Object.values(styles);

      res.send(output)
      //res.send(styles);
      //res.send(results[1])
    })
    .catch(e => console.log(e))
});

app.get('/:id/related', (req, res) => {
  let id = req.params.id;
  if (id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query = 'SELECT related_id FROM related where product_id=?'
  queryPromise(query, [id])
    .then(results => {
      const idList = results.map(({ related_id }) => related_id);
      res.send(idList);
    })
    .catch(e => console.log(e))
});

app.get('/:id', (req, res) => {
  let id = req.params.id;
  if (id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query1 = 'SELECT * FROM products p where p.id=? LIMIT 1'
  const query2 = 'SELECT feature,value FROM features f where f.product_id=?;'
  Promise.all([queryPromise(query1, [id]), queryPromise(query2, [id])])
    .then(results => {
      const output = { ...results[0][0], features: results[1] }
      res.send(output)
    })
    .catch(e => console.log(e))
})


const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

