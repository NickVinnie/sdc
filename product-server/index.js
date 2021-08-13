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

const productQuery = () => {
  return new Promise ((resolve, reject) => {
    pool.query(`SELECT * FROM product`, [], (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows[0])
      }
    })
  })
}

//ROUTES

//get all products
app.get('/products', (req, res) => {
  productQuery()
    .then(products => {
      console.log(products);
      res.send(products);
    })
    .catch(err => {
      console.log(err);
    })
})

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})
