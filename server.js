const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
const DB = "mongodb://localhost:27017/plannings";

dotenv.config({path: './config.env'});

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
}).then(()=> console.log("Database connection succesful"));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

