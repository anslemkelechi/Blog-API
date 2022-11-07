const appError = require('./../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new appError(400, message);
};
const handleDuplicateKeyDB = (err) => {
  const value = err.keyValue.email;
  console.log(value);
  const message = `Duplicate field value: '${value}' Please use another value`;
  return new appError(400, message);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid field data ${errors.join('. ')} Critical Error`;
  return new appError(400, message);
};
const handleJWTError = (err) =>
  new appError(401, 'Invalid token. Please login again');
const handleJWTExpiredError = (err) =>
  new appError(401, 'Your token is expired, Please login again');

const errorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
const errorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming Errors or other unknown Error: Don't leak error details
  } else {
    console.error('ERROR 💣', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Server Error';
  if (process.env.NODE_ENV == 'Development') {
    console.log(err);
    errorDev(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    console.log(err);
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateKeyDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    errorProd(error, res);
  }
};
