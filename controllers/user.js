const httpConstants = require('http2').constants;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

module.exports.getUser = (req, res, next) => {
  User.find({})
    .then((user) => { res.status(httpConstants.HTTP_STATUS_OK).send(user); })
    .catch((error) => next(error));
};

module.exports.postUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(httpConstants.HTTP_STATUS_CREATED).send({
      name: user.name, about: user.about, avatar: user.avatar, _id: user._id, email: user.email,
    }))
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else if (error.code === 11000) {
        next(new ConflictError('Пользователь с указанным email уже зарегистрирован'));
      } else {
        next(error);
      }
    });
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => { res.status(httpConstants.HTTP_STATUS_OK).send(user); })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Передан некорректный ID'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Пользователь с укзаанным id не найден'));
      } else {
        next(error);
      }
    });
};

module.exports.patchProfile = (req, res, next) => {
  const { name, about } = req.body;
  if (req.user._id) {
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
      .orFail()
      .then((user) => { res.status(httpConstants.HTTP_STATUS_OK).send(user); })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(error.message));
        } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
          next(new NotFoundError('Пользователь с укзаанным id не найден'));
        } else {
          next(error);
        }
      });
  }
};

module.exports.patchAvatar = (req, res, next) => {
  if (req.user._id) {
    User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.body.avatar },
      { new: true, runValidators: true },
    )
      .orFail()
      .then((user) => { res.status(httpConstants.HTTP_STATUS_OK).send(user); })
      .catch(((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          next(new BadRequestError(error.message));
        } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
          next(new NotFoundError('Пользователь с укзаанным id не найден'));
        } else {
          next(error);
        }
      }
      ));
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.getProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.status(httpConstants.HTTP_STATUS_OK).send(user))
    .catch(next);
};
