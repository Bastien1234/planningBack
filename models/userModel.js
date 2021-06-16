const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    indexDay: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true
    }
});

const messagesSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    from: String,
    message: String
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },

    lastName: {
        type: String,
        required: true
    },

    isAdmin: {
        type: Boolean,
        required: true
    },

    daysOff: {
        type: [Number],
        required: true
    },

    shifts: {
        type: [shiftSchema],
        index: true,
        sparse: true
    },

    messages: [messagesSchema]

    // change requests

    // history

});

const Users = mongoose.model('Users', userSchema);

module.exports = Users;