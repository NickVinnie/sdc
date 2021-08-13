const express = require('express');
const { pool } = require('./db.js');
const fs = require('fs');
const csv = require('fast-csv');
const app = express();
const port = 3000;

app.use(express.json());

pool.connect((err) => {
  if (err) {
    console.log('CONNECT ERR: ', err);
  } else {
    console.log('connected to database')
  }
})

let counter = 0;

const countProductQuery = () => {
  return new Promise ((resolve, reject) => {
    pool.query('SELECT COUNT(*) FROM product', [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        counter = parseInt(res.rows[0].count);
        resolve();
      }
    });
  })
}

const productQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM product WHERE id = ${id}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows[0])
      }
    })

  })
}

const featuresQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM features WHERE product_id = ${id}`, [], (err, res) => {
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

const stylesCreator = (stylesArray) => {
  const createStylesArray = stylesArray.map((style) => new Promise((resolve, reject) => {
    let styleObj = {
      style_id: style.id,
      name: style.name,
      original_price: style.original_price,
      sale_price: style.sale_price,
      "default?": style.default_style,
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
  }));
  return createStylesArray;
}

const createProduct = (id) => {
  return new Promise((resolve, reject) => {
    productQuery(id)
      .then(product => {
        let doc = product;
        featuresQuery(id)
          .then(features => {
            doc.features = [];
            features.forEach(feature => {
              doc.features.push(
                {
                  feature: feature.feature,
                  value: feature.value
                }
              )
            })
            relatedQuery(id)
              .then(relateds => {
                doc.related = [];
                relateds.forEach(related => {
                  doc.related.push(related.related_product_id);
                })
                stylesQuery(id)
                  .then(styles => {
                    Promise.all(stylesCreator(styles))
                      .then(res => {
                        doc.styles = res;
                        resolve(doc);
                      })
                      .catch(err => {
                        reject('stylesCreator: ', err);
                      })
                  })
                  .catch(err => {
                    reject('stylesQuery: ', err);
                  })
              })
              .catch(err => {
                reject('relatedQuery: ', err);
              })
          })
          .catch(err => {
            reject('featuresQuery: ', err);
          })
    })
    .catch(err => {
      reject('productQuery: ', err);
    })
  })
}

const writeProduct = (id) => {
  console.log('id ', id);
  createProduct(id)
    .then(obj => {
      // fs.appendFile(`../products-json/product`, JSON.stringify(obj), () => {
      //   i += 1
      //   if (i <= counter) {
      //     writeProduct(i);
      //   }
      // })
    })
}

let i = 1;

const createProducts = () => {
  countProductQuery()
    .then(() => {
      writeProduct(i);
    })
    .catch(err => {
      console.log('createProducts: ', err);
    });
}

createProducts();


app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
