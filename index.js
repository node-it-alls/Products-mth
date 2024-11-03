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
const map ={};
app.use((req,res,next)=>req.path in map ?res.send(map[req.path]):next());

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
app.get('/:id/styles2', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  //MEGA JOIN
  // const query1 = "select s.id as style_id,name,original_price,sale_price,default_style,GROUP_CONCAT(thumbnail_url,\",\",url SEPARATOR ',') as photos ,GROUP_CONCAT(CONCAT(sk.id,',',size,',',quantity) SEPARATOR ',') as skus  from styles s left join photos p on s.id=p.style_id  left join skus sk on s.id=sk.style_id where s.product_id=1 GROUP BY s.id";
  //WORKING
  // const query1 = "select * from (SELECT style_id,GROUP_CONCAT(sk.id,',',size,',',quantity SEPARATOR ',') as skus from skus sk join styles on styles.id=sk.style_id where product_id=1 GROUP BY styles.id) as skus join (SELECT style_id,GROUP_CONCAT(thumbnail_url,',',url SEPARATOR ',') as photos from photos photoTable join styles on photoTable.style_id=styles.id where product_id=1 GROUP BY styles.id) as photos on photos.style_id=skus.style_id";
  // const query1 = "select  styles.id,styles.name,styles.original_price,styles.sale_price,styles.default_style,photos,skus from styles LEFT join (SELECT style_id,GROUP_CONCAT(thumbnail_url,',',url SEPARATOR ',') as photos from photos photoTable join styles on photoTable.style_id=styles.id where product_id=? GROUP BY styles.id) as photoQuery on photoQuery.style_id=styles.id join(SELECT style_id,name,original_price,sale_price,default_style,GROUP_CONCAT(sk.id,',',size,',',quantity SEPARATOR ',') as skus from skus sk join styles on styles.id=sk.style_id where product_id=? GROUP BY styles.id) as skusQuery on photoQuery.style_id=skusQuery.style_id";
  // const query1 = "select  styles.id,styles.name,styles.original_price,styles.sale_price,styles.default_style from styles join (select * from photos p) as p2 on styles.id=p2.styles_id  where product_id=?";
  const query1 =
  `SELECT * FROM styles
  LEFT JOIN photos_concat ON styles.id=photos_concat.style_id  LEFT JOIN skus_concat ON styles.id=skus_concat.style_id  where product_id = ?`;
  queryPromise(query1, [id,id])
    .then(results => {
      /*const output = {product_id:id,results:[]};
      const styles ={}
      results.forEach(result=>{
        const {id,style_id,name,original_price,sale_price,default_style}=result;
        styles[style_id]={style_id,name,original_price,sale_price,default_style}
        const splitPhotos = result.photos.split(',');
        const photos =[];
        for(let i =0; i < splitPhotos.length;i+=2){
          const [thumbnail_url,url]=splitPhotos[i];
          //photos.push({thumbnail_url,url});
          photos.push(splitPhotos[i],splitPhotos[i+1]);
        }
        styles[style_id]['photos']=photos;
        styles[style_id]['photos']=result.photos;
        //styles[id]['photos'] = result.photos.map((thumbnail_url,url)=>{thumbnail_url,url});

      })
      output['results']=Object.values(styles);*/
      res.send(results)
      //res.send(output);
    })
    .catch(e => console.log(e))
});

app.get('/:id/styles', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  //SKU AND PHOTOS join skus s
  const query1 = "SELECT st.id,name,original_price,sale_price,default_style,GROUP_CONCAT(thumbnail_url SEPARATOR ',') as thumbnails,GROUP_CONCAT(url SEPARATOR ',') as photos from styles st join photos p on st.id=p.style_id where product_id=? GROUP BY style_id;"
  const query2 = 'SELECT st.id as styles_id,s.id as sku_id,size,quantity from styles st join skus s on st.id=s.style_id where product_id=? ;'
  Promise.all([queryPromise(query1, [id]), queryPromise(query2, [id])])
    .then(results => {
      const output = {product_id:id,results:[]};
      const styles ={}
      results[0].forEach(result=>{
        const {id,style_id,name,original_price,sale_price,default_style}=result;
        styles[id]={
          style_id:id,
          name,
          original_price:original_price+".00",
          sale_price:sale_price?sale_price+".00":null,
          'default?':!!default_style
        };
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
      res[req.path]=output;
      res.send(output)
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

