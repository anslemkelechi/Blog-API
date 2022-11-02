const express = require('express');
const app = express();
const UserRouter = require('./routes/userRoute');
const blogRouter = require('./routes/blogRoute')
const appError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const globalErrHandler = require('./controllers/errorController');


//GLOBAL MIDDLEWARES
app.use(express.json());
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
