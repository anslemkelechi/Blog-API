const mongoose = require('mongoose')
const app = require('./app')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })


//CREATE DB CONNECTION
mongoose.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((con) => {
    console.log('DB Connection Successful');
})

//Connect To Server 
const port = process.env.PORT || 8080
const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
})