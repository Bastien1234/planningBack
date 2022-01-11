const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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

    team: {
        type: String,
        required: [true, "please provide a team for this user"]
    },

    isAdmin: {
        type: Boolean,
        required: true
    },

    email: {
        type: String,
        required: [true, "please provide an email for this user"],
        unique: true
    },

    password: {
        type: String,
        required: [true, "please provide password"],
        minLength: 8,
        select: false
    },

    confirmPassword: {
        type: String,
        required: [true, "please confirm password"],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!"
        },
        select: false
    },

    daysOff: { // Does not really prevents from entering wrong stuff...
        type: [Number],
        min: [2, "Can't be negative, moron"],
        max: [2, "no day after sundayz"],
        required: [true, "Please provide days off"]
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

userSchema.pre('save', async function(next)
{
    // We are only using this middleware in case that the password field is modified
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);

    // Don't need the confirm password anymore
    this.confirmPassword = undefined

    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword)
{
    return await bcrypt.compare(candidatePassword, userPassword);
}

const Users = mongoose.model('Users', userSchema);

module.exports = Users;