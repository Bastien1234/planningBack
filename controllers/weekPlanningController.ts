const WeekPlanning = require('./../models/weekPlanningModel');

exports.createWeek = async(req, res, next) => {
    try {
        const newWeek = await WeekPlanning.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newWeek
    });
    } catch (err) {
        console.log(err);
        res.status(400).json({
            status: 'failed',
            data: err
        });
    };
    
};