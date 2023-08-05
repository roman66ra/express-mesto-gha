const router = require('express').Router();
const {
  getUser, postUser, getUserById, patchAvatar, patchProfile,
} = require('../controllers/user');

router.get('/users', getUser);
router.get('/users/:userId', getUserById);
router.post('/users', postUser);
router.patch('/users/me', patchProfile);
router.patch('/users/me/avatar', patchAvatar);

module.exports = router;