const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
}).then(() => console.log('BD'));

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64cb67f40414d991327311ae',
  };

  next();
});
app.use('/', require('./routes/user'));
app.use('/', require('./routes/card'));

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
