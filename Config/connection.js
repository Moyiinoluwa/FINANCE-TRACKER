const mongoose = require('mongoose')

const connect = async () => {
    try {
        const connection = await mongoose.connect(process.env.CONNECTION_STRING)
        console.log('databse connected')

    } catch (error) {
        throw error
    }
}

module.exports = connect;