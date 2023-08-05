const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const app = express();
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64cb67f40414d991327311ae',
  };

  next();
});
app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.use((req, res) => {
  res.status(404).send({ message: 'Sorry cant find that!' });
});
app.use(helmet());

app.listen(PORT);
