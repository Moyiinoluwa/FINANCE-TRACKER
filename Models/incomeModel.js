const mongoose = require('mongoose')

const incomeSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
      required: true ,
       ref: 'User'
  },
    
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