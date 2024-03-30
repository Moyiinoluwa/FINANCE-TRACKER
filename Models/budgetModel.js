const mongoose = require('mongoose')


const budgetSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
      required: true ,
       ref: 'User'
  },
   
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