const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [true, 'username has been taken']
    },

    email: {
        type: String,
        required: true,
        unique: [true, 'username has been taken']
    },

    password: {
        type: String,
        required: true,
    },

    isLoggedIn: {
        type: Boolean,
        default: false,
    },

    isLoggedOut: {
        type: Boolean,
        default: false,
    },

    isresetPasswordLinkSent: {
        type: Boolean,
        default: false
    },

    resentLink: {
        type: String,
        default: ''
    },

    resentLinkExpirationTime: {
        type: Date
    }

}, {
    timestamps: true
});


module.exports = mongoose.model('User', userSchema)