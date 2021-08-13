# ETL to PostgreSQL and JSON document

## Steps to extract/transform CSV data

Depending on if you want to move the data to postgreSQL or MongoDB, edit the start script in package.json to point to either the copy-csv.js (postgreSQL) or create-docs.js (mongoDB) file.

### CSV to postgreSQL
  1. Create database and schema in the schema.sql and run the script. Make sure the column titles are the same name and order as in the input CSV file.
  2. In db.js configure the database pool information.
  3. Specify input/output variable in copy-csv.js:
    - csvPath
    - tableName
    - csvName
  4. Run script with npm start

### CSV to json doc
  1. Edit queries to match the csv tables. May involve deleting or adding new promise functions and manipulating the reponses as it should.
  2. Specify output file in writeProduct function.