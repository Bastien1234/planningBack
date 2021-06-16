const express = require('express');
const router = express.Router();

const UsersController = require('./../controllers/usersController');
const { createUser, getAllUsers, generateNextWeek } = UsersController;

router
    .route('/')
    .post(createUser)
    .get(getAllUsers)

router.post('/generate', generateNextWeek)

module.exports = router;