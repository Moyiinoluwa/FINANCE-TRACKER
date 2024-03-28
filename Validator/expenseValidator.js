const joi = require('joi')

const Validator = (schema) => (payload) =>
schema.validate(payload, {abortEarly: false})


//add expense
const addExpenseValidator = joi.object({
    amount: joi.string().required(),
    item: joi.string().required(),
    category: joi.string().required()
});

//update expense
const updateExpenseValidator = joi.object({
    amount: joi.string().required(),
    item: joi.string().required(),
    category: joi.string().required()
});

//add income
const addIncomeValidator = joi.object({
    source: joi.string().required(),
    amount: joi.string().required(),
    month: joi.string().required()
});

//update income
const updateIncomeValidator = joi.object({
    source: joi.string().required(),
    amount: joi.string().required(),
    month: joi.string().required()
});

exports.addExpenseValidator = Validator(addExpenseValidator)
exports.updateExpenseValidator = Validator(updateExpenseValidator)
exports.addIncomeValidator = Validator(addIncomeValidator)
exports.updateIncomeValidator = Validator(updateIncomeValidator)