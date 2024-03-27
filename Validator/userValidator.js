const joi = require('joi')

const validator = (schema) => (payload) =>
schema.validate(payload, { abortEarly: false})


//create user
const createUserValidator = joi.object({
    username: joi.string().lowercase().required(),
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).max(16).required()
});


//login
const loginValidator = joi.object({
    email: joi.string().email().lowercase().required(),
    password: joi.string().min(8).max(16).required()
});

//update user 
const updateUserVaildator = joi.object({
    username: joi.string().lowercase().required(),
    email: joi.string().email().lowercase().required()
});

//verify otp code
const verifyCodeValidator = joi.object({
    email: joi.string().email().lowercase().required(),
    otp: joi.string().min(6).max(6).required()
});


//resend otp
const resendOtpValidator = joi.object({
    email: joi.string().email().lowercase().required()
});

//reset password link
const resetlinkValidator = joi.object({
    email: joi.string().email().lowercase().required(),
});

//change password
const changePasswordValidator = joi.object({
    oldPassword: joi.string().min(8).max(16).required(),
    newPassword: joi.string().min(8).max(16).required()
});


//reset password
const resetPasswordValidator = joi.object({
    resetLink: joi.string().required(),
    email: joi.string().email().lowercase().required()
})

exports.createUserValidator = validator(createUserValidator)
exports.loginValidator = validator(loginValidator)
exports.updateUserVaildator = validator(updateUserVaildator)
exports.verifyCodeValidator = validator(verifyCodeValidator)
exports.resendOtpValidator = validator(resendOtpValidator)
exports.resetlinkValidator = validator(resetlinkValidator)
exports.changePasswordValidator = validator(changePasswordValidator)
exports.resetPasswordValidator = validator(resetPasswordValidator)