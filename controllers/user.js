const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.getUser = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.postUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Введены некорректные данные' });
      } else { res.status(500).send({ message: 'Ошибка при создании карточки' }); }
    });
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => { res.status(200).send(user); })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({ message: 'Передан некорректный ID' });
      } else if (error.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Пользователь с укзаанным id не найден' });
      } else {
        res.status(500).send('Произошла ошибка');
      }
    });
};

module.exports.patchProfile = (req, res) => {
  const { name, about } = req.body;
  if (req.user._id) {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .orFail()
      .then((user) => res.send(user))
      .catch((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: 'Преданы некорректные данные при обновлении информации о пользователе' });
        } else if (error.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: 'Пользователь с укзаанным id не найден' });
        } else {
          res.status(500).send('Произошла ошибка');
        }
      });
  }
};

module.exports.patchAvatar = (req, res) => {
  if (req.user._id) {
    User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.body.avatar },
      { new: true, runValidators: true },
    )
      .orFail()
      .then((user) => res.send(user))
      .catch(((error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send({ message: 'Передан некорректный url' });
        } else if (error.name === 'DocumentNotFoundError') {
          res.status(404).send({ message: 'Пользователь с укзаанным id не найден' });
        } else {
          res.status(500).send('Произошла ошибка');
        }
      }
      ));
  }
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });

      res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
