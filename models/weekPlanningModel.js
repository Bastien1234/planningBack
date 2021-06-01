const mongoose = require('mongoose');

const weekPlanningSchema = new mongoose.Schema({
    day: {
        type: Date,
        required: true,
        default: Date.now()
    },
    user: {
        type: String,
        required: true
    }
});

const WeekPlanning = mongoose.model('WeekPlanning', weekPlanningSchema);

module.exports = WeekPlanning;