const mongoose = require('mongoose')


const otpSchema = mongoose.Schema({
    otp: {
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true
    },

    expirationTime: {
        type: Date,
        required: true
    },

    verified: {
        type: Boolean,
        default: false
    },  

}, {
    timestamps: true
});


module.exports = mongoose.model('Otp', otpSchema)