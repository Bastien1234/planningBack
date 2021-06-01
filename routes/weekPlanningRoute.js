const express = require('express');
const weekPlanningController = require('./../controllers/weekPlanningController');

const { createWeek } = weekPlanningController; 

const router = express.Router();

router
    .route('/')
    .post(createWeek)

module.exports = router;