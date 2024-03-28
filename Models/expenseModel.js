const mongoose = require('mongoose')


const expenseSchema = mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//    },

    item: {
        type: String,
        required: true
    },

    amount: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    date: {
        type: Date
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Expense', expenseSchema)