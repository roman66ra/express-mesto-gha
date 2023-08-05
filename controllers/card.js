const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(500).send({ message: 'Ошибка при получении карточек' });
      }
    });
};

module.exports.createCard = (req, res) => {
  const { name, link} = req.body;
  // eslint-disable-next-line no-underscore-dangle
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        res.status(400).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else { res.status(500).send({ message: 'Ошибка при создании карточки' }); }
    });
};

module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send(card))
    .catch(() => res.status(404).send({ message: 'Карточка с указанным _id не найдена' }));
};

module.exports.putLikeCard = (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для снятии лайка.' });
      } else if (error.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};

module.exports.deleteLikeCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      res.send(card);
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        res.status(400).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else if (error.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Передан несуществующий _id карточки.' });
      } else {
        res.status(500).send({ message: 'Произошла ошибка' });
      }
    });
};
