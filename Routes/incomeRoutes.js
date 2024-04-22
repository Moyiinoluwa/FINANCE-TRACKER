const express = require('express')
const router = express.Router()
const Controller = require('../Controllers/incomeController')
const validateToken = require('../Middleware/validateToken')


//create user
router.post('/create', Controller.createUser)

//login
router.post('/login',  Controller.login)

//get all user
router.get('/get',  Controller.allUsers)

//update user
router.put('/update', validateToken, Controller.updateUser)

//delete user 
router.delete('/delete', validateToken, Controller.deleteUser)

//verify otp
router.post('/verify', Controller.verifyCode)

//resend otp
router.post('/resend', Controller.resendVerificationCode)

//reset password link
router.post('/reset-password-link', Controller.resetPasswordLink)

//change password
router.patch('/change-password', validateToken, Controller.changePassword)

//reset password
router.post('/reset', Controller.resetPassword)

//add expense
router.post('/add-expense', validateToken, Controller.addExpense)

//get all expenses
router.get('/get-expense', validateToken, Controller.allExpense)

//get expenses in a category
router.get('/expense/:category', Controller.categoryExpenses)

//update expense
router.put('/update-expense/:id', validateToken, Controller.updateExpense)

//delete expense
router.delete('/delete-expense/:id', validateToken, Controller.deleteExpense)

//add income
router.post('/add-income', validateToken, Controller.addIncome)

//get all income
router.get('/get-income', validateToken, Controller.allIncome)

//update income
router.put('/update-income/:id', validateToken, Controller.updateIncome)

//delete income
router.delete('/delete-income/:id', validateToken, Controller.deleteIncome)

//create bugdet
router.post('/create-budget', validateToken, Controller.createBudget)

//get all budgert
router.get('/get-budget', validateToken, Controller.getBugdet)

//update budget
router.put('/update-budget/:id', validateToken, Controller.updateBudget)

//delete budget
router.delete('/delete-budget/:id', validateToken, Controller.deleteBugdet)

//count all budget
router.get('/count-budget', Controller.countBudget)

//spending notification message
router.get('/notification', Controller.limitNotification)



module.exports = router;