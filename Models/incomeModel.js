const mongoose = require('mongoose')

const incomeSchema = mongoose.Schema({
    source: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    month: {
        type: String,
        required: true
    },

     
}, {
    timestamps: true
});


module.exports = mongoose.model('Income', incomeSchema)