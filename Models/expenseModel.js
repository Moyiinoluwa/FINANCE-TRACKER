const mongoose = require('mongoose')


const expenseSchema = mongoose.Schema({
     user_id: {
         type: mongoose.Schema.Types.ObjectId,
       required: true ,
        ref: 'User'
   },

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