const express = require('express');
const app = express();
const UserRouter = require('./routes/userRoute');
const blogRouter = require('./routes/blogRoute');
const appError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const globalErrHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

//GLOBAL MIDDLEWARES



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/articles', blogRouter);

//Global Error Handler
app.all('*', (req, res, next) => {
  return next(
    new appError(404, `${req.originalUrl} cannot be found in this application`)
  );
});

app.use(globalErrHandler);
module.exports = app;
