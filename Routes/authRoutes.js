const express = require('express')
const router = express.Router()
const Controller = require('../Controllers/authController')


//create user
router.post('/create', Controller.createUser)

//login
router.post('/login', Controller.login)

//get all user
router.get('/get', Controller.allUsers)

//update user
router.put('/update', Controller.updateUser)

//delete user 
router.delete('/delete', Controller.deleteUser)

//verify otp
router.post('/verify', Controller.verifyCode)

//resend otp
router.post('/resend', Controller.resendVerificationCode)

//reset password link
router.post('/reset-password-link', Controller.resetPasswordLink)

//change password
router.patch('/change-password', Controller.changePassword)

//reset password
router.post('/reset', Controller.resetPassword)



module.exports = router;