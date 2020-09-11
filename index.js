const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Expression = require('./expression');

const API_PORT = 5000;
const app = express();
app.use(cors());

const dbRoute =
    `mongodb://${process.env.USER}:${process.env.AUTHKEY}@sezzle-web-calculator-shard-00-00.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-01.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-02.urh1h.mongodb.net:27017/expressions?ssl=true&replicaSet=atlas-qic6uj-shard-0&authSource=admin&retryWrites=true&w=majority`;
console.log(`Route: ${dbRoute}`);
mongoose.connect(dbRoute, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true
});

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));
db.on('error', () => console.error('MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/api/expressions', (req, res) => {
  Expression.find({}, 'expression', {sort: "-date"}, (err, data) => {
    if (err) {
      return res.json({ success: false, error: err });
    }
    console.log(data);
    return res.json({ success: true, data: data });
  }).limit(10);
});

app.post('/api/expressions', (req, res) => {
  let data = new Expression();
  const { expression } = req.body;
  data.expression = expression;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});

const path = require("path");
app.use(express.static(path.join(__dirname, "client/build")));
const indexPath = path.resolve(__dirname, "client", "build", "index.html");
console.log(`Serving index file from: ${indexPath}`);
app.get("*", (req, res) => {
  res.sendFile(indexPath);
})

const port = process.env.PORT || API_PORT
app.listen(port, () => console.log(`LISTENING ON PORT ${port}`));
