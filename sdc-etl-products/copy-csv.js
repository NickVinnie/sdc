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

const csvName = 'features';
const tableName = 'features';
const csvPath = `/Users/nickhanrahan/Documents/hackreact/sdc-project/sdc-csv-data/${csvName}.csv`;

let counter = 0;

let cols = [];
let queryCols = '';

const createQuery = (rowData) => {
  if (counter > 0) {
    let queryArgs = '';
    for (var i = 0; i < cols.length; i++) {
      if (parseInt(rowData[i])) {
        queryArgs += `'${rowData[i]}'`;
      } else {
        let valString = '';
        for (var j = 0; j < rowData[i].length; j++) {
          if (rowData[i][j] !== `'`) {
            valString += rowData[i][j];
          } else {
            valString += `''`;
          }
        }
        queryArgs += `'${valString}'`;
      }
      if (i < cols.length - 1) {
        queryArgs += ', ';
      }
    }
    pool.query(`INSERT INTO ${tableName}(${queryCols}) VALUES (${queryArgs})`, (err) => {
      if (err) {
        console.log('cols: ', `(${queryCols})`);
        console.log('args: ', `(${queryArgs})`);
        console.log('QUERY ERR: ', err);
      }
    });
  } else {
    cols = [...rowData];
    let stringCols = '';
    for (var i = 0; i < cols.length; i++) {
      stringCols += `${cols[i]}`;
      if (i < cols.length - 1) {
        stringCols += ', ';
      }
    }
    queryCols = stringCols;
  }
  counter++;
}

const csvReadStream = fs.createReadStream(csvPath)
  .pipe(csv.parse())
  .on('data', (row) => {
    csvReadStream.pause();

    let promisedQuery = () => {
      return new Promise ((resolve, reject) => {
        let beginCount = counter;
        createQuery(row);
        if (counter === beginCount + 1) {
          resolve();
        } else {
          console.log('PROMISE ERR: ', err);
        }
      });
    }

    promisedQuery()
      .then(() => {
        csvReadStream.resume()
      })
      .catch((err) => {
        console.log('PROMISE ERR2: ', err);
      })
  })

app.listen(port, () => {
  console.log(`listening on port ${port}`);
})

