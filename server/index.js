const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Expression = require('./expression');

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

const dbRoute =
    `mongodb://user:E3jMs33OymDkdoIG@sezzle-web-calculator-shard-00-00.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-01.urh1h.mongodb.net:27017,sezzle-web-calculator-shard-00-02.urh1h.mongodb.net:27017/expressions?ssl=true&replicaSet=atlas-qic6uj-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose.connect(dbRoute, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true
});

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// this is our get method
// this method fetches all available data in our database
router.get('/expressions', (req, res) => {
  Expression.find({}, 'expression', {sort: "-date"}, (err, data) => {
    if (err) {
      return res.json({ success: false, error: err });
    }
    console.log(data);
    return res.json({ success: true, data: data });
  }).limit(10);
});

router.post('/expressions', (req, res) => {
  let data = new Expression();
  const { expression } = req.body;
  data.expression = expression;
  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});


app.use('/api', router);

app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
