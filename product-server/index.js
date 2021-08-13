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

const productQuery = (id) => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM product WHERE id = ${id}`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        let infoObj = res.rows[0];
        featuresQuery(id)
          .then(features => {
            infoObj.features = [];
            features.forEach(feature => {
              infoObj.features.push({
                feature: feature.feature,
                value: feature.value
              })
            })
            resolve(infoObj)
          })
      }
    })
  })
}


//ROUTES

//get product info by id
app.get('/products/:id', (req, res) => {
  const { id } = req.params
  productQuery(id)
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      console.log(err);
    })
})



app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
