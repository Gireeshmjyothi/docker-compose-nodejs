import express from "express"
import path from 'path';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app = express();

const DB_USER = process.env.MONGO_DB_USERNAME
const DB_PASS = process.env.MONGO_DB_PWD

console.log(" db user name ------>>",DB_USER);
console.log(" db user password ------>>",DB_PASS);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
  });

// when starting app locally, use "mongodb://admin:password@localhost:27017" URL instead
let mongoUrlDockerCompose = `mongodb://${DB_USER}:${DB_PASS}@mongodb`;
console.log("Mongo connection URL :", mongoUrlDockerCompose);
// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

console.log("mongo client options ::", mongoClientOptions);
// the following db and collection will be created on first connect
let databaseName = "my-db";
let collectionName = "my-collection";
console.log("fetching data");

app.get('/fetch-data', function (req, res) {
    console.log("Fetching data from my-collection");
  let response = {};
  MongoClient.connect(mongoUrlDockerCompose, mongoClientOptions, function (err, client) {
    
    if (err){
        console.log("Error while conneting to mongodb", err.message);
        throw err;
    } 

    let db = client.db(databaseName);

    let myquery = { my_id: 1234};

    db.collection(collectionName).findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});

app.listen(8000, function () {
  console.log("app listening on port 8000!");
});
