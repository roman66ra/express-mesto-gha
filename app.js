const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');

const { login, postUser } = require('./controllers/user');
const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(bodyParser.json());

app.post('/signin', login);
app.post('/signup', postUser);

app.use('/', auth, require('./routes/user'));
app.use('/', auth, require('./routes/card'));

app.use((req, res) => {
  res.status(404).send({ message: 'Sorry cant find that!' });
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.use(helmet());

app.listen(PORT);
