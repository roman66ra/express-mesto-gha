const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      Card.findById(card._id)
        .orFail()
        .populate('owner')
        .then((data) => res.status(httpConstants.HTTP_STATUS_CREATED).send(data))
        .catch((error) => {
          if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Карточка с введенным ID не найдена'));
          } else {
            next(error);
          }
        });
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Вы не являетесь владельцем карточки');
      }
      Card.deleteOne(card)
        .orFail()
        .then(() => res.status(httpConstants.HTTP_STATUS_OK).send({ message: 'Карточка удалена' }))
        .catch((error) => {
          if (error instanceof mongoose.Error.CastError) {
            next(new BadRequestError('Переданы некорректные данные для удаления карточки.'));
          } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Карточка с введенным ID не найдена'));
          } else {
            next(error);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        next(new NotFoundError('Карточка с указанным id не найдена'));
      } else {
        next(err);
      }
    });
};

module.exports.putLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .populate(['owner', 'likes'])
    .orFail()
    .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные для постановки  лайка.'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка с введенным ID не найдена'));
      } else {
        next(error);
      }
    });
};

module.exports.deleteLikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные для снятии лайка.'));
      } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка с введенным ID не найдена'));
      } else {
        next(error);
      }
    });
};
