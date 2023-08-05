const User = require('../models/user');

module.exports.getUser = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.postUser = (req, res) => {
  const { name, about, avatar } = req.body;
  console.log(req.body);

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};

module.exports.getUserById = (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: 'Пользователь не найден' });
      }
      return res.status(200).send(user);
    })
    .catch(() => res.status(500).send('Произошла ошибка'));
};

module.exports.patchProfile = (req, res) => {
  const { name, about } = req.body;
  // eslint-disable-next-line no-underscore-dangle
  if (req.user._id) {
    // eslint-disable-next-line no-underscore-dangle
    User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
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
  // eslint-disable-next-line no-underscore-dangle
  if (req.user._id) {
    User.findByIdAndUpdate(
      // eslint-disable-next-line no-underscore-dangle
      req.user._id,
      { avatar: req.body.avatar },
      { new: true, runValidators: true },
    )
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