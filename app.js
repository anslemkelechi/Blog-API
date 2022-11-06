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
//Allow cross-origin access
app.use(cors());

//Set security HTTP headers
app.use(helmet());

const limiter = rateLimit({
  max: 500,
  windowMs: 24 * 60 * 60 * 1000,
  standardHeaders: true,
  message: 'Too Many Request From this IP, please try again in an hour',
});

//Set API Limit
app.use('/api', limiter);

//Data Sanitization against NOSQL query Injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//Allow views
app.use(express.static(`${__dirname}/views`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(express.json());
app.use(express.urlencoded());
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
