const asyncHandler = require('express-async-handler')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../Models/userModel');
const Otp = require('../Models/userOtpModel')
const { createUserValidator, loginValidator, updateUserVaildator, verifyCodeValidator,
    resendOtpValidator, resetlinkValidator, changePasswordValidator, resetPasswordValidator } = require('../Validator/userValidator');
const { registrationMail, verficationCodeMail, resetLinkMail } = require('../Shared/mailer');




//Generate Otp
const createOtp = () => {
    const min = 100000;
    const max = 999999;
    const otp = Math.floor(min + Math.random() * (max - min) + 1).toString()
    return otp
}


//create a user 
const createUser = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await createUserValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { username, email, password } = req.body;

        //check if user has registered
        const user = await User.findOne({ email })
        if (user) {
            res.status(403).json({ message: 'User has been registered' })
        }

        //hash the passsword
        const hash = await bcrypt.hash(password, 10)

        //create a new user
        const newUser = new User({
            username,
            email,
            password: hash
        });

        //save new user to database
        await newUser.save()

        //send verification code to user via mail
        const verificationCode = createOtp()
        await registrationMail(email, verificationCode, username)

        //set expiration time for verification code
        const otpTime = new Date()
        otpTime.setMinutes(otpTime.getMinutes() + 5)

        //save verification code to database
        const userOtp = new Otp()
        userOtp.otp = verificationCode
        userOtp.email = email
        userOtp.expirationTime = otpTime

        await userOtp.save()

        res.status(200).json(newUser)

    } catch (error) {
        throw error
    }
});

//user login
const login = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await loginValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { email, password } = req.body;

        //check if user is registered
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ message: 'email is not registered' })
        }

        //compare the password and grant access 
        if (password && await bcrypt.compare(password, user.password)) {

            //get  the accessToken 
            const accessToken = jwt.sign({
                userToken: {
                    email: user.id,
                    username: user.username,
                    id: user.id
                }

                //create the access key
            }, process.env.ACCESS_KEY,

                //set expiration time for the accessToken
                { expiresIn: '1yr' }
            )
            res.status(200).json(accessToken)
        } else {
            res.status(404).json({ message: 'incorrect email or password' })
        }
    } catch (error) {
        throw error
    }
});

//get all users
const allUsers = asyncHandler(async (req, res) => {
    try {
        //find all users registered
        const user = await User.find()

        // send a response
        res.status(200).json(user)

    } catch (error) {
        throw error
    }
});

//update user
const updateUser = asyncHandler(async (req, res) => {
    try {
        //validate
        const { error, value } = await updateUserVaildator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { username, email } = req.body;

        //find user
        const user = await User.findByIdAndUpdate(req.params.id)
        if (!user) {
            res.status(404).json({ message: 'Cant update user' })
        }

        //update user information
        user.email = email
        user.username = username

        res.status(200).json(user)

    } catch (error) {
        throw error
    }
});

//delete user profile
const deleteUser = asyncHandler(async (req, res) => {
    try {
        //find user
        const user = await User.findByIdAndDelete(req.params.id)
        if (!user) {
            res.status(404).json({ message: 'cannot delete user' })
        }

        res.status(200).json({ message: 'user deleted' })

    } catch (error) {
        throw error
    }
});

//verify verification code
const verifyCode = asyncHandler(async (req, res) => {
    try {
        const { error, value } = await verifyCodeValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { email, otp } = req.body;

        //check if the email is registered on the otp database
        const userEmail = await Otp.findOne({ email })
        if (!userEmail) {
            res.status(404).json({ message: 'This even did not receive the otp' })
        }

        //check if the verification code is correct
        const user = await Otp.findOne({ otp })
        if (!user) {
            res.status(404).json({ message: 'The otp is incorrect' })
        }

        //set expiration time for verification code
        const timer = new Date()
        timer.setMinutes(timer.getMinutes() + 5)

        //check if the verification has expired
        if (user.expirationTime <= new Date()) {
            res.status(401).json({ message: 'otp has expired' })
        }

        //find the user linked to the email
        const usser = await User.findOne({ email })
        if (!usser) {
            res.status(404).json({ message: 'this user is not registered' })
        }

        //verify code
        user.verified = true

        res.status(200).json({ message: 'Otp verified' })

    } catch (error) {
        throw error
    }
});

//resend otp
const resendVerificationCode = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await resendOtpValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body;

        //check if the email is registered
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ message: 'cant resend to email' })
        }

        //send a new verification code to user via mail
        const code = createOtp()
        await verficationCodeMail(email, code, user.username)

        //set expiration time for verification code
        const timer = new Date()
        timer.setMinutes(timer.getMinutes() + 5)

        //save new code to database
        const newVerification = new Otp()
        newVerification.email = email
        newVerification.otp = code
        newVerification.expirationTime = timer

        await newVerification.save()

        res.status(200).json({ message: 'Verification code resent' })

    } catch (error) {
        throw error
    }
})

//reset password link
const resetPasswordLink = asyncHandler(async (req, res) => {
    try {
        //validate user input
        const { error, value } = await resetlinkValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { email } = req.body;

        //check if user is registered
        const user = await User.findOne({ email })
        if (!user) {
            res.status()
        }

        //get reset token
        const token = uuidv4()

        //set expiration time for  the token
        const expirationLink = new Date()
        expirationLink.setMinutes(expirationLink.getMinutes() + 5)

        //craft the reset link
        const resetLink = `http://localhost:3003/api/auth/reset-password?token=${token}&email=${email}`

        //update user table
        user.resetLink = resetLink
        user.isresetPasswordLinkSent = true
        user.resentLinkExpirationTime = expirationLink

        //save to database 
        await user.save()

        //send reset link to user via mail
        await resetLinkMail(email, resetLink, user.username)

        res.status(200).json({ message: 'password reset link sent' })

    } catch (error) {
        throw error
    }
});


//reset password
const resetPassword = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await resetPasswordValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { resetLink, email, password } = req.body;

        //find user
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ message: 'invalid user' })
        }

        //validate the resetlink
        if (user.resetLink !== resetLink) {
            res.status(403).json({ message: 'invalid reset link' })
        }

        //set expiration time for the reset link
        const expirationLink = new Date()
        expirationLink.setMinutes(expirationLink.getMinutes() + 5)

        //hash password
        const hashPassword = await bcrypt.hash(password, 10)

        //save new passsword to database
        user.password = hashPassword
        user.resentLinkExpirationTime = expirationLink

        await user.save()

    } catch (error) {
        throw error
    }
});


//change user password
const changePassword = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await changePasswordValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        const { id } = req.params

        const { oldPassword, newPassword } = req.body;

        //check if user is registered
        const user = await User.findById(id)
        if (!user) {
            res.status(404).json({ message: 'user not allowed' })
        }

        //compare the password and set a new password
        if (oldPassword && await bcrypt.compare(oldPassword, user.password)) {

            //hash password
            const hash = await bcrypt.hash(newPassword, 10)

            //update password
            user.password = hash

            //save new password to database
            await user.save()

            res.status(200).json({ message: 'Password changed' })
        }
    } catch (error) {
        throw error
    }
});



module.exports = {
    createUser,
    login,
    allUsers,
    updateUser,
    deleteUser,
    verifyCode,
    resendVerificationCode,
    resetPasswordLink,
    changePassword,
    resetPassword
}