const mongoose = require('mongoose')


const budgetSchema = mongoose.Schema({
    category: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    spendinglimit: {
        type: String,
        required: true
    },
    
}, {
    timestamps: true
});


module.exports = mongoose.model('Budget', budgetSchema)