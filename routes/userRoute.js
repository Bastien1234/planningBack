const express = require('express');
const router = express.Router();

const UsersController = require('./../controllers/usersController');
const AuthContoller = require('./../controllers/authController');

const { createUser, deleteUser, modifyUser, getAllUsers, generateCurrentMonth, deleteCurrentMonth, sendMessage, deleteMessage, requestVacations, requestShiftChange, testServer } = UsersController;
const { signup, login, protect, restrictTo, updatePassword } = AuthContoller; // Maybe we could use sendEmail for forgotten passwords in the futur

router.get('testServer', testServer)

router.route('/getAllUsers/:team').get(getAllUsers)

router.post('/signup', signup)
router.post('/login', login)



// router.post('/generate', generateNextWeek)
router.route('/generateMonth').post(protect, generateCurrentMonth)
router.route('/deleteMonth').delete(protect, deleteCurrentMonth)

router.post('/requestChangeShift', requestShiftChange)

router.route('/changePassword').put(updatePassword)

router.post('/requestVacations', requestVacations)
router.post('/sendMessage', sendMessage)
router.route('/deleteMessage/:id/:messageid').delete(deleteMessage)


router
    .route('/:id')
    .delete(deleteUser)



module.exports = router;