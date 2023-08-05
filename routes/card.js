const router = require('express').Router();
const {
  getCards, deleteCardById, createCard, putLikeCard, deleteLikeCard,
} = require('../controllers/card');

router.get('/cards', getCards);
router.delete('/cards/:cardId', deleteCardById);
router.post('/cards', createCard);
router.put('/cards/:cardId/likes', putLikeCard);
router.delete('/cards/:cardId/likes', deleteLikeCard);

module.exports = router;
