const router = require('express').Router();
const {
  getUser, getUserById, patchAvatar, patchProfile, getProfile,
} = require('../controllers/user');

router.get('/users', getUser);
router.get('/users/:userId', getUserById);
router.patch('/users/me', patchProfile);
router.patch('/users/me/avatar', patchAvatar);
router.get('/users/me', getProfile);

module.exports = router;
