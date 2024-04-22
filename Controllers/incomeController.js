const asyncHandler = require('express-async-handler')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../Models/userModel');
const Otp = require('../Models/userOtpModel')
const Expense = require('../Models/expenseModel')
const Income = require('../Models/incomeModel')
const Budget = require('../Models/budgetModel')
const { createUserValidator, loginValidator, updateUserVaildator, verifyCodeValidator,
    resendOtpValidator, resetlinkValidator, changePasswordValidator, resetPasswordValidator } = require('../Validator/userValidator');
const { registrationMail, verficationCodeMail, resetLinkMail } = require('../Shared/mailer');
const { addExpenseValidator, updateExpenseValidator, addIncomeValidator, updateIncomeValidator, createBudgetValidator, updateBudgetValidator } = require('../Validator/expenseValidator');



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
            password: hash,
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
                user: {
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
        const resetLink = `http://localhost:3003/api/income/reset-password?token=${token}&email=${email}`

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

//Expense tracking
//Add a new expense
const addExpense = asyncHandler(async (req, res) => {
    try {
        //validate the input
        const { error, value } = await addExpenseValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        //extract from the request body
        const { amount, item, date, category } = req.body;

        //create new expense
        const expense = new Expense({
            user_id: req.user.id,
            category, 
            amount,
            item,
            date
        })

        //save to database
        await expense.save()

        res.status(200).json({ message: 'expense added' })

    } catch (error) {
        throw error
    }
});

//Get all expense
const allExpense = asyncHandler(async (req, res) => {
    try {
        //find all expenses
        const expense = await Expense.find()

        res.status(200).json(expense)

    } catch (error) {
        throw error
    }
});

//to get expense for a particular category
const categoryExpenses = asyncHandler(async (req, res) => {
    try {
        //extract the catergory from the request parameter
        const { category } = req.params

        //find expenses for the catergory
        const expense = await Expense.find({ category: category})

        res.status(200).json(expense)

    } catch (error) {
        throw error
    } 
});


// update expense
const updateExpense = asyncHandler(async (req, res) => {
    try {
        // Validate the input
        const { error, value } = await updateExpenseValidator(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json(error.message);
        }

        // Extract expense ID and updated fields from request body
        const { id } = req.params;
        const { amount, item, date } = req.body;

        // Find the expense by ID
        const expense = await Expense.findById(id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Update 
        expense.amount = amount;
        expense.item = item;
        expense.date = date;

        await expense.save();

        res.status(200).json(expense);

    } catch (error) {
        throw error
    }
});

//delete expense
const deleteExpense = asyncHandler(async (req, res) => {
    try {
        //find expense by Id
        const { id } = req.params
        const expense = await Expense.findByIdAndDelete(id)

        if (!expense) {
            res.status(404).json({ message: 'Cant delete expense' })
        }

        res.status(200).json({ message: 'expense deleted' })

    } catch (error) {
        throw error
    }
})


//Income data
//Add new income
const addIncome = asyncHandler(async (req, res) => {
    try {
        const { error, value } = await addIncomeValidator(req.body, { abortEarly: false })
        if (error) {
            res.status(400).json(error.message)
        }

        //require fields from request body
        const { source, amount, month } = req.body;

        //create new income tracker
        const newIncome = new Income({
            user_id: req.user.id,
            source,
            amount,
            month
        });

        //save to database
        await newIncome.save()

        res.status(200).json(newIncome)

    } catch (error) {
        throw error
    }
});

//Get all income
const allIncome = asyncHandler(async(req, res) => {
    try {
        //find all income
        const income = await Income.find()

        res.status(200).json(income)

    } catch (error) {
        throw error
    }
});

//update Income
const updateIncome = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await updateIncomeValidator(req.body, { abortEarly: false })
        if(error) {
            res.status(400).json(error.message)
        }

        const { source, amount, month } = req.body;

        //find the income to be updated
        const { id } = req.params

        const income = await Income.findById(id)
        if(!income) {
            res.status(404).json({ message: 'Income cant be updated'})
        }

        //update the income
        income.source = source
        income.amount = amount
        income.month = month

        //save to database
        await income.save()

        res.status(200).json(income)

    } catch (error) {
       throw error 
    }
});


//delete user 
const deleteIncome = asyncHandler(async(req, res) => {
    try {
        //find the income by id
        const { id } = req.params

        const income = await Income.findById(id)
        if(!income) {
            res.status(404).json({ message: 'wrong income'})
        }

        res.status(200).json({ message: 'Income deleted'})

    } catch (error) {
        throw error
    }
});

//Budgeting
//Create a budet for each catergory
const createBudget = asyncHandler(async(req, res) => {
    try {
        const { error, value } = await createBudgetValidator(req.body, { abortEarly: false }) 
        if(error) {
            res.status(400).json(error.message)
        }

        //extract fields from request body
        const { category, amount, spendingLimit } = req.body;

        //check if bugdet exist
        const { id } = req.params

        const budget = await Budget.findById(id)
        if(budget) {
            res.status(401).json({ message: 'budget already exist'})
        }

        //create new budget
        const newBudget = new Budget({
            user_id: req.user.id,
            category,
            amount,
            spendingLimit
        });

        //save to database
        await newBudget.save()

        res.status(200).json(newBudget)

    } catch (error) {
        throw error
    }
});


//Get all budget
const getBugdet = asyncHandler(async(req, res) => {
    try {
        //find all budget created
        const bugdet = await Budget.find()

        res.status(200).json(bugdet)

    } catch (error) {
        throw error
    }
});

//count all the budget
const countBudget = asyncHandler(async(req, res) => {
    try {
        // count the budgets
        const budget = await Budget.countDocuments() 
        if(budget === undefined) {
            res.status(404).json({ message: 'No budget '})
        }

        res.status(200).json({ budgetCount: budget})

    } catch (error) {
        throw error
    }
})
//update budget
const updateBudget = asyncHandler(async(req, res) => {
    try {
        //validate the input
        const { error, value } = await updateBudgetValidator(req.body, { abortEarly: false }) 
        if(error) {
            res.status(400).json(error.message)
        }

        //extract the required fields from the request body
        const { category, amount, spendingLimit} = req.body;

        //extract the Id from the request parameter
        const { id } = req.params

        //find the budget to be updated
        const budget = await Budget.findById(id)
        if(!budget) {
            res.status(404).json({ message: 'cant find budget'})
        }

        //update budget
        budget.category = category
        budget.amount = amount
        budget.spendingLimit = spendingLimit

        //save to database
        await budget.save()

        res.status(200).json({ message: 'budget updated'})

    } catch (error) {
        throw error
    }
})

//delete budget
const deleteBugdet = asyncHandler(async(req, res) => {
    try {
        //extract id  from request parameter
        const { id } = req.params

        //find budget by id 
        const budget = await Budget.findByIdAndDelete(id)
        if(!budget) {
            res.status(404).json({ message: 'cant delete budget'})
        } else {
            res.status(200).json({ message: 'bugdet deleted'})
        }
    } catch (error) {
        throw error
    }
});

//User get notified if she's almost at the budget spending limit
const limitNotification = asyncHandler(async(req, res) => {
    try {
        //extract the budget id from the request parameter
        const { id } = req.params

        //find the budget
        const budget = await Budget.findById(id)
        if(!budget) {
            res.status(404).json({ message: 'cant find budget'})
        }

        const { currentSpending } = req.body;

        //if the user has spent up to 90% of the spending limit set while creating the budget
        if(currentSpending >= budget.spendingLimit * 0.9) {

            //set a notification to the user
            res.status(2000).json({ message: 'Almost at the spending limit'})
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
    resetPassword,
    addExpense,
    allExpense,
    categoryExpenses,
    updateExpense,
    deleteExpense,
    addIncome,
    allIncome,
    updateIncome,
    deleteIncome,
    createBudget,
    getBugdet,
    updateBudget,
    deleteBugdet,
    countBudget,
    limitNotification
}