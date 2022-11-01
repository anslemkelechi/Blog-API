const express = require('express')
const app = express();
const UserRouter = require('./routes/userRoute')
const appError = require('./utils/appError')
const globalErrHandler = require('./controllers/errorController')
//const BlogRouter = require('./routes/')

//GLOBAL MIDDLEWARES
app.use(express.json());
app.use('/api/v1/users', UserRouter)

//Global Error Handler
app.all('*', (req, res, next) => {
    return next(new appError(404, `${req.originalUrl} cannot be found in this application`))
})

app.use(globalErrHandler)
module.exports = app;
