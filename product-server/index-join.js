const express = require('express');
const app = express();
const port = 3000;
const { pool } = require('./db/db.js')

app.use(express.json());

pool.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('connected to database: ' + pool.options.database);
  }
})

//DATABASE QUERIES

const productQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM product, features WHERE product.id = features.product_id AND features.product_id = ${id}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        infoObj = {
          id: res.rows[0].product_id,
          name: res.rows[0].name,
          slogan: res.rows[0].slogan,
          description: res.rows[0].description,
          category: res.rows[0].category,
          default_price: res.rows[0].default_price,
          features: []
        }
        res.rows.forEach(feature => {
          infoObj.features.push({
            feature: feature.feature,
            value: feature.value
          })
        })
        resolve(infoObj);
      }
    })
  })
}

const photosQuery = (styleId) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM photos WHERE styleId = ${styleId}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    })
  })
}

const skusQuery = (styleId) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM skus WHERE styleid = ${styleId}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    })
  })
}

const stylesQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM styles WHERE productId = ${id}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    })
  })
}

const relatedQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM related WHERE current_product_id = ${id}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    })
  })
}

//HELPERS

const stylesObjectCreator = (stylesArray) => {
  const createStylesArray = stylesArray.map((style) => new Promise((resolve, reject) => {

    let salePriceFormat = 0;
    if (style.sale_price !== 'null') {
      salePriceFormat = style.sale_price;
    }

    let defaultFormat = false;
    if (style.default_style === 1) {
      defaultFormat = true
    }

    let styleObj = {
      style_id: style.id,
      name: style.name,
      original_price: style.original_price,
      sale_price: salePriceFormat,
      "default?": defaultFormat,
      photos: [],
      skus: {}
    }

    photosQuery(style.id)
      .then(photos => {
        photos.forEach(photo => {
          styleObj.photos.push(
            {
              url: photo.url,
              thumbnail_url: photo.thumbnail_url
            }
          )
        })
        resolve(styleObj);
      })
      .catch(err => {
        reject('photosQuery: ', err);
      })

    skusQuery(style.id)
      .then(skus => {
        skus.forEach(sku => {
          styleObj.skus[sku.id] = {
            quantity: sku.quantity,
            size: sku.size
          }
        })
      })
      .catch(err => {
        reject('skusQuery: ', err);
      })
  }));
  return createStylesArray;
}

//ROUTES

//get product info by id
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  productQuery(id)
    .then(product => {
      res.status(200);
      res.send(product);
    })
    .catch(err => {
      res.status(404);
      res.send(err);
    })
})

//get styles by product id
app.get('/products/:id/styles', (req, res) => {
  const { id } = req.params;
  stylesQuery(id)
    .then(styles => {
      let stylesObj = {
        product_id: id
      }
      Promise.all(stylesObjectCreator(styles))
        .then(stylesResults => {
          stylesObj.results = stylesResults
          res.status(200);
          res.send(stylesObj);
        })
        .catch(err => {
          res.status(404);
          res.send(err);
        })
    })
    .catch(err => {
      res.status(404);
      res.send(err);
    })
})

//get related ids
app.get('/products/:id/related', (req,res) => {
  const { id } = req.params;
  relatedQuery(id)
    .then(relateds => {
      related = [];
      relateds.forEach(relatedObj => {
        related.push(relatedObj.related_product_id);
      });
      res.status(200);
      res.send(related);
    })
    .catch(err => {
      res.status(404);
      res.send(err);
    })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
