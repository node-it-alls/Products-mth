const express = require('express');
const { promisify } = require('util');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
require('dotenv').config()
const { LRUCache } = require('lru-cache')
const path = require('path');
const CACHING_ENABLED = false;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port:process.env.DB_PORT,
  connectionLimit: 75,
});
app.use(express.static(path.join(__dirname,'Dist')));
const queryPromise = promisify(pool.query).bind(pool);

let cache = null;
if (CACHING_ENABLED) {
  cache = new LRUCache({
    max: 333000,
    updateAgeOnGet: true,
    updateAgeOnHas: true,
  });
  app.use((req, res, next) => {
    const key = getKey(req);
    if (cache.has(key)) {
      return res.send(cache.get(key));
    }
    next();
  });
}

const logAndSend = (e, res, statusCode = 400) => {
  console.log(e);
  res.sendStatus(statusCode);
};

const getKey = req => req.path + "," + (req.query.page || "") + ',' + (req.query.count || "");

const mapAndSend = (res, key, val) => {
  if (CACHING_ENABLED) {
    cache.set(key, val);
  }
  res.send(val);
};


app.get('/', (req, res) => {
  let page = Number(req.query.page) || 1;
  let count = Number(req.query.count) || 5;
  if (page < 1 || page % 1 !== 0) {
    return res.status(400).send("Invalid Page");
  }
  if (count < 1 || count % 1 !== 0 || count > 20000) {
    return res.status(400).send("Invalid count");
  }
  const query = 'SELECT * FROM products LIMIT ? OFFSET ?';
  queryPromise(query, [count, count * (page - 1)])
    .then(results => {
      mapAndSend(res, getKey(req), results);
    })
    .catch(e => logAndSend(e, res));
});

app.get('/:id/styles2', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query1 =
    `SELECT *  FROM styles
    LEFT JOIN photos_concat
    ON styles.id=photos_concat.style_id
    LEFT JOIN skus_concat
    ON styles.id=skus_concat.style_id
    WHERE product_id = ${id}`;
  queryPromise(query1)
    .then(results => {
      const output = { product_id: id, results: [] };
      const styles = {};
      results.forEach(result => {
        const defaultStyle = !!result['default?'];
        const { id, style_id, name } = result;
        let { original_price, sale_price } = result;
        original_price = original_price ? Number(original_price).toFixed(2) : original_price;
        sale_price = sale_price ? Number(sale_price).toFixed(2) : sale_price;
        styles[style_id] = { style_id, name, original_price, sale_price, 'default?': defaultStyle };
        const splitPhotos = result.photos?.split(',') || [];
        const photos = [];
        styles[style_id]['photos'] = photos;
        for (let i = 0; i < splitPhotos.length; i += 2) {
          const [thumbnail_url, url] = [splitPhotos[i], splitPhotos[i + 1]];
          photos.push({ thumbnail_url, url });
        }
        const resSkus = result.skus?.split(',') || ['null', null, null];
        const skus = {};
        styles[style_id]['skus'] = skus;
        for (let i = 0; i < resSkus.length; i += 3) {
          let [sku_id, size, quantity] = [resSkus[i], resSkus[i + 1], Number(resSkus[i + 2])];
          if (result.skus === null) quantity = resSkus[i + 2];
          skus[sku_id] = { quantity, size };
        }
      });
      output['results'] = Object.values(styles);
      mapAndSend(res, getKey(req), output);
    })
    .catch(e => logAndSend(e, res));
});

app.get('/:id/styles', (req, res) => {
  let id = req.params.id;
  if (!id || id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query1 =
    `SELECT st.id,name,original_price,sale_price,\`default?\`,photos
    FROM styles st
    LEFT JOIN photos_concat p
    ON st.id=p.style_id
    WHERE product_id=${id}`;
  const query2 =
    `SELECT st.id as styles_id,s.id as sku_id,size,quantity
    FROM styles st
    LEFT JOIN skus s on st.id=s.style_id
    WHERE product_id=${id} `;
  Promise.all([queryPromise(query1), queryPromise(query2)])
    .then(results => {
      const output = { product_id: id, results: [] };
      const styles = {};
      results[0].forEach(result => {
        const { id, style_id, name, original_price, sale_price } = result;
        styles[id] = {
          style_id: id,
          name,
          original_price: original_price + ".00",
          sale_price: sale_price ? sale_price + ".00" : null,
          'default?': !!result['default?']
        };
        const splitPhotos = result.photos?.split(',') || [null, null];
        styles[id].photos = [];
        for (let i = 0; i < splitPhotos.length; i += 2) {
          const [thumbnail_url, url] = [splitPhotos[i], splitPhotos[i + 1]];
          styles[id].photos.push({ thumbnail_url, url });
        }
        styles[id].skus = {};
      });
      results[1].forEach(result => {
        const { sku_id, styles_id, size, quantity } = result;
        styles[styles_id]['skus'][sku_id] = { quantity, size };
      });
      output.results = Object.values(styles);
      res[req.path] = output;
      mapAndSend(res, getKey(req), output);
    })
    .catch(e => logAndSend(e, res));
});

app.get('/:id/related', (req, res) => {
  let id = req.params.id;
  if (id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query = 'SELECT related_id FROM related where product_id=?';
  queryPromise(query, [id])
    .then(results => {
      const idList = results.map(({ related_id }) => related_id);
      mapAndSend(res, getKey(req), idList);
    })
    .catch(e => logAndSend(e, res));
});

app.get('/:id', (req, res) => {
  let id = req.params.id;
  if (id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query1 = 'SELECT * FROM products p where p.id=? LIMIT 1';
  const query2 = 'SELECT feature,value FROM features f where f.product_id=?';
  Promise.all([queryPromise(query1, [id]), queryPromise(query2, [id])])
    .then(results => {
      const output = { ...results[0][0], features: results[1] };
      output['default_price'] = Number(output['default_price']).toFixed(2);
      mapAndSend(res, getKey(req), output);
    })
    .catch(e => logAndSend(e, res));
});

app.get('/:id/2', (req, res) => {
  let id = req.params.id;
  if (id < 0 || id % 1 !== 0) return res.status(400).send("invalid id");
  const query1 =
    `SELECT p.id, name, slogan, description, category, default_price,
    GROUP_CONCAT(feature,',',IFNULL(value,'NULL')) as features
    FROM products p
    LEFT JOIN features f
    ON p.id=f.product_id
    WHERE f.product_id=?`;
  queryPromise(query1, [id, id])
    .then(results => {
      const output = { ...results[0] };
      let featureList = results[0].features?.split(',') || [];
      output['default_price'] = Number(output['default_price']).toFixed(2);
      let newFeatures = [];
      output['features'] = newFeatures;
      for (let i = 0; i < featureList.length; i += 2) {
        let [feature, value] = [featureList[i], featureList[i + 1]];
        value = value === 'NULL' ? null : value;
        newFeatures.push({ feature, value });
      }
      mapAndSend(res, getKey(req), output);
    })
    .catch(e => logAndSend(e, res));
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

