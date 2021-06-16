const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Users = require('./../models/userModel');

const DB = "mongodb://localhost:27017/plannings";

dotenv.config({path: './config.env'});

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
}).then(()=> console.log("Database connection succesful"));

const database = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

const importData = async () => {
    try {
        await Users.create(database, { validateBeforeSave: false })
        console.log('Users loaded successfully !');
    } catch (e) {
        console.log('error occured !')
        console.log(e);
    };

    process.exit();
};

const deleteData = async () => {
    try {
        await Users.deleteMany();
        console.log("All users deleted");
    } catch(e) {
        console.log("Error occured");
        console.log(e);
    };

    process.exit();
}

importData();
// 



