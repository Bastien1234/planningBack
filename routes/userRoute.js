const express = require('express');
const router = express.Router();

const UsersController = require('./../controllers/usersController');
const AuthContoller = require('./../controllers/authController');

const { createUser, deleteUser, modifyUser, getAllUsers, generateCurrentMonth, deleteCurrentMonth, sendMessage, deleteMessage, requestVacations, requestShiftChange } = UsersController;
const { signup, login, protect, restrictTo, updatePassword } = AuthContoller; // Maybe we could use sendEmail for forgotten passwords in the futur

router
    .route('/')
    //.post(createUser)
    .put(modifyUser)
    .post(getAllUsers)

router.post('/signup', signup)
router.post('/login', login)

// router.post('/generate', generateNextWeek)
router.post('/generateMonth', generateCurrentMonth)
router.route('/deleteMonth').delete(deleteCurrentMonth)

router.post('/requestChangeShift', requestShiftChange)

router.post('/requestVacations', requestVacations)
router.post('/sendMessage', sendMessage)
router.route('/deleteMessage/:id/:messageid').delete(deleteMessage)


router
    .route('/:id')
    .delete(deleteUser)



module.exports = router;