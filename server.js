const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

//


/*
const DB = "mongodb://localhost:27017/plannings";
*/

// Link config to our process.env variable (config.env)
dotenv.config({path: './config.env'});

const pwd = process.env.DATABASE_PASSWORD
const DB = process.env.DATABASE.replace("<password>", pwd);

console.log("db : \n", DB);

// Config of process listeners

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
  });

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});



mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})
.then(()=> console.log("Database connection successful"));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});



