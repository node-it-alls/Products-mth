const axios = require('axios');
const path = require('path');
const PRODUCT_ID_OFFSET = -40343;
const STYLE_ID_OFFSET = -240499;
const SKU_ID_OFFSET =-1394768
const host = 'http://localhost:4000';
const firstProduct = 40344 + PRODUCT_ID_OFFSET;
  const firstStyle = 240500 + STYLE_ID_OFFSET;
  const firstSku= 1394769+ SKU_ID_OFFSET;
test('the products should return all the fields for /:id route', () => {

  const results = axios.get(path.join(host, firstProduct.toString())).then(res => {
    const testData = {
      "id": firstProduct,
      "name": "Camo Onesie",
      "slogan": "Blend in to your crowd",
      "description": "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
      "category": "Jackets",
      "default_price": "140.00",
      "features": [
        {
          "feature": "Fabric",
          "value": "Canvas"
        },
        {
          "feature": "Buttons",
          "value": "Brass"
        }
      ]
    };
    expect(res.data.id).toBe(testData.id);
    expect(res.data.name).toBe(testData.name);
    expect(res.data.slogan).toBe(testData.slogan);
    expect(res.data.description).toBe(testData.description);
    expect(res.data.category).toBe(testData.category);
    expect(Number(res.data.default_price).toFixed(2)).toBe(testData.default_price);
    expect(res.data.features.length).toBe(testData.features.length);
    let features = res.data.features || [];
    expect(res.data.features).toEqual(testData.features);
  });
});

test('the products should return all the fields for /:id route ', () => {
  const secondProduct = 40345 + PRODUCT_ID_OFFSET
  const results = axios.get(path.join(host, secondProduct.toString())).then(res => {
    const testData = {
      "id": secondProduct,
      "name": "Bright Future Sunglasses",
      "slogan": "You've got to wear shades",
      "description": "Where you're going you might not need roads, but you definitely need some shades. Give those baby blues a rest and let the future shine bright on these timeless lenses.",
      "category": "Accessories",
      "default_price": "69.00",
      "features": [
        {
          "feature": "Lenses",
          "value": "Ultrasheen"
        },
        {
          "feature": "UV Protection",
          "value": null
        },
        {
          "feature": "Frames",
          "value": "LightCompose"
        }
      ]
    };
    expect(res.data.id).toBe(testData.id);
    expect(res.data.name).toBe(testData.name);
    expect(res.data.slogan).toBe(testData.slogan);
    expect(res.data.description).toBe(testData.description);
    expect(res.data.category).toBe(testData.category);
    expect(Number(res.data.default_price).toFixed(2)).toBe(testData.default_price);
    expect(res.data.features.length).toBe(testData.features.length);
    let features = res.data.features || [];
    expect(res.data.features).toEqual(testData.features);
  });
});
test('the products should return all the fields for / main route ', () => {
  const results = axios.get(path.join(host)).then(res => {
    const testData =
      [
        {
          "id": firstProduct,
          "name": "Camo Onesie",
          "slogan": "Blend in to your crowd",
          "description": "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
          "category": "Jackets",
          "default_price": "140"
        },
        {
          "id": firstProduct + 1,
          "name": "Bright Future Sunglasses",
          "slogan": "You've got to wear shades",
          "description": "Where you're going you might not need roads, but you definitely need some shades. Give those baby blues a rest and let the future shine bright on these timeless lenses.",
          "category": "Accessories",
          "default_price": "69"
        },
        {
          "id": firstProduct + 2,
          "name": "Morning Joggers",
          "slogan": "Make yourself a morning person",
          "description": "Whether you're a morning person or not.  Whether you're gym bound or not.  Everyone looks good in joggers.",
          "category": "Pants",
          "default_price": "40"
        },
        {
          "id": firstProduct + 3,
          "name": "Slacker's Slacks",
          "slogan": "Comfortable for everything, or nothing",
          "description": "I'll tell you how great they are after I nap for a bit.",
          "category": "Pants",
          "default_price": "65"
        },
        {
          "id": firstProduct + 4,
          "name": "Heir Force Ones",
          "slogan": "A sneaker dynasty",
          "description": "Now where da boxes where I keep mine? You should peep mine, maybe once or twice but never three times. I'm just a sneaker pro, I love Pumas and shell toes, but can't nothin compare to a fresh crispy white pearl",
          "category": "Kicks",
          "default_price": "99"
        }
      ];
    res.data.forEach((entry, i) => expect(entry).toEqual(testData[i]));
  });
});
test('the products should work correctly with page and count variables / main products route ', () => {
  const firstProduct = 40344 + PRODUCT_ID_OFFSET;
  const results = axios.get(path.join(host, "?page=2&count=3")).then(res => {
    const testData = [
      {
        "id": 40347,
        "campus": "hr-rfp",
        "name": "Slacker's Slacks",
        "slogan": "Comfortable for everything, or nothing",
        "description": "I'll tell you how great they are after I nap for a bit.",
        "category": "Pants",
        "default_price": "65.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      },
      {
        "id": 40348,
        "campus": "hr-rfp",
        "name": "Heir Force Ones",
        "slogan": "A sneaker dynasty",
        "description": "Now where da boxes where I keep mine? You should peep mine, maybe once or twice but never three times. I'm just a sneaker pro, I love Pumas and shell toes, but can't nothin compare to a fresh crispy white pearl",
        "category": "Kicks",
        "default_price": "99.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      },
      {
        "id": 40349,
        "campus": "hr-rfp",
        "name": "Pumped Up Kicks",
        "slogan": "Faster than a just about anything",
        "description": "The Pumped Up serves up crisp court style with a modern look. These shoes show off tennis-whites shades and are constructed with a supple leather upper and a classic rubber cupsole.",
        "category": "Kicks",
        "default_price": "89.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      }
    ].map((entry, i) => {
      entry.id = 40347 + PRODUCT_ID_OFFSET + i;
      entry.default_price = Number(entry.default_price).toString();
      delete entry['campus'];
      delete entry['created_at'];
      delete entry['updated_at'];
      return entry;
    });
    res.data.forEach((entry, i) => expect(entry).toEqual(testData[i]));
  });
});

test('the related route  should return all related_id\'s  product_id', () => {
  const fp = firstProduct;
  const results = axios.get(path.join(host, firstProduct.toString(), 'related')).then(res => {
    expect(res.data.length).toBe(4);
    expect(res.data).toEqual([fp + 1, fp + 2, fp + 7, fp + 6].map(x => x.toString()));
  });
});

test('the related route  should return all related_id\'s further in DB ', () => {
  const hundredthProduct = 40344 + PRODUCT_ID_OFFSET + 7;
  const hp = hundredthProduct;
  const results = axios.get(path.join(host, hp.toString(), 'related')).then(res => {
    const testData = [40345, 40346, 40347, 40350, 40352, 40353]
    expect(res.data.length).toBe(testData.length);
    expect(res.data).toEqual(testData.map(x => (x + PRODUCT_ID_OFFSET).toString()));
  });
});
test('the products should work correctly with page and count variables / main products route ', () => {
  const results = axios.get(path.join(host, "?page=2&count=3")).then(res => {
    const testData = [
      {
        "id": 40347,
        "campus": "hr-rfp",
        "name": "Slacker's Slacks",
        "slogan": "Comfortable for everything, or nothing",
        "description": "I'll tell you how great they are after I nap for a bit.",
        "category": "Pants",
        "default_price": "65.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      },
      {
        "id": 40348,
        "campus": "hr-rfp",
        "name": "Heir Force Ones",
        "slogan": "A sneaker dynasty",
        "description": "Now where da boxes where I keep mine? You should peep mine, maybe once or twice but never three times. I'm just a sneaker pro, I love Pumas and shell toes, but can't nothin compare to a fresh crispy white pearl",
        "category": "Kicks",
        "default_price": "99.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      },
      {
        "id": 40349,
        "campus": "hr-rfp",
        "name": "Pumped Up Kicks",
        "slogan": "Faster than a just about anything",
        "description": "The Pumped Up serves up crisp court style with a modern look. These shoes show off tennis-whites shades and are constructed with a supple leather upper and a classic rubber cupsole.",
        "category": "Kicks",
        "default_price": "89.00",
        "created_at": "2021-08-13T14:38:44.509Z",
        "updated_at": "2021-08-13T14:38:44.509Z"
      }
    ].map((entry, i) => {
      entry.id = 40347 + PRODUCT_ID_OFFSET + i;
      entry.default_price = Number(entry.default_price).toString();
      delete entry['campus'];
      delete entry['created_at'];
      delete entry['updated_at'];
      return entry;
    });
    res.data.forEach((entry, i) => expect(entry).toEqual(testData[i]));
  });
});
test('the styles route should return almost matching data to the heeroku ', () => {

  const results = axios.get(path.join(host, firstProduct.toString(),"styles")).then(res => {
const testData={
  "product_id": firstProduct,
  "results": [
      {
          "style_id": firstStyle,
          "name": "Forest Green & Black",
          "original_price": "140.00",
          "sale_price": null,
          "default?": true,
          "photos": [
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1501088430049-71c79fa3283e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1501088430049-71c79fa3283e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80"
              },
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1534011546717-407bced4d25c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1534011546717-407bced4d25c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2734&q=80"
              },
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1549831243-a69a0b3d39e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1549831243-a69a0b3d39e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2775&q=80"
              },
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1527522883525-97119bfce82d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1527522883525-97119bfce82d?ixlib=rb-1.2.1&auto=format&fit=crop&w=668&q=80"
              },
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1556648202-80e751c133da?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1556648202-80e751c133da?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80"
              },
              {
                  "thumbnail_url": "https://images.unsplash.com/photo-1532543491484-63e29b3c1f5d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80",
                  "url": "https://images.unsplash.com/photo-1532543491484-63e29b3c1f5d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1000&q=80"
              }
          ],
          "skus": {
            1394769: {
                  "quantity": 8,
                  "size": "XS"
              },
              1394770: {
                  "quantity": 16,
                  "size": "S"
              },
              1394771: {
                  "quantity": 17,
                  "size": "M"
              },
              1394772: {
                  "quantity": 10,
                  "size": "L"
              },
              1394773: {
                  "quantity": 15,
                  "size": "XL"
              },
              1394774: {
                  "quantity": 4,
                  "size": "XL"
              }
          }
      }]
    };
    const oldSkus= Object.entries(testData.results[0].skus);
    const newSkus = oldSkus.map(([id,val],i)=>[(Number(id)+SKU_ID_OFFSET).toString(),val]);
    testData.results[0].skus=Object.fromEntries(newSkus)
    expect(Number(res.data.product_id)).toBe(testData.product_id)
    expect(res.data.results[0]).toEqual(testData.results[0]);
  })
});