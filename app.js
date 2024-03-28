const express = require('express')
const errorHandler = require('./Middleware/errorhandler')
const connect = require('./Config/connection')
const env = require('dotenv').config()
const morgan = require('morgan')

const app = express()



//database connection
connect()

//JSON parser
app.use(express.json())
app.use(morgan('tiny'))


//error handler 
app.use(errorHandler)

//API
app.use('/api/income', require('./Routes/incomeRoutes'))


const PORT = process.env.PORT || 3005

//listen for port
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})