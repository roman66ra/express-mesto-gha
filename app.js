const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const { celebrate, Joi, errors } = require('celebrate');

const { login, postUser } = require('./controllers/user');
const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(bodyParser.json());

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().pattern(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/),
    password: Joi.string().required().min(2),
  }).unknown(true),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(/^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)/i),
    email: Joi.string().required().pattern(/^[^ ]+@[^ ]+\.[a-z]{2,3}$/),
    password: Joi.string().required().min(2),
  }).unknown(true),
}), postUser);

app.use('/', auth, require('./routes/user'));
app.use('/', auth, require('./routes/card'));

app.use((req, res) => {
  res.status(404).send({ message: 'Страница не найдена' });
});

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'На сервере произошла ошибка'
      : message,
  });
  next();
});

app.use(helmet());

app.listen(PORT);
