const appError = require('./../utils/appError');

const errorDev = (err,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Server Error'
    errorDev(err,res)
    console.log(err);
    return next()
}