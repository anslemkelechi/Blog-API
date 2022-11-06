const mongoose = require('mongoose');
const app = require('./app');
const dotenv = require('dotenv');
const { db } = require('./models/blogModel');

//Uncaught Exception handler
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 🔥 Shutting Down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

//CREATE DB CONNECTION
let DB = process.env.DATABASE_PROD.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

if (process.env.NODE_ENV == 'Development') {
  DB = process.env.DATABASE_LOCAL;
}
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB Connection Successful');
  });

//Connect To Server
const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! 🔥 Shutting Down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
