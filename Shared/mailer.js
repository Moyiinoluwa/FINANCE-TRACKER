const mail = require('../Service/mailer.service')


const registrationMail = async (email, verficationCode, username) => {
    const subject = 'User verification'
    const body = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
    <h1>OTP Verification</h1>
    <h1>Hello ${username}</h1>
    <h1> Your One Time Password (OTP) is : ${verficationCode}</h1>
    <P> This password is for a limited time</P>
    <p> If you did not request for OTP kindly ignore this message, your account is safe with us</p>
    </body>
    </html>
    `
    await mail.mailService.sendEmail(email, subject, body)
}

const verficationCodeMail = async (email, verficationCode, username) => {
    const subject = 'Code verification'
    const body = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
    <h1>Verification</h1>
    <h1>Hello ${username}</h1>
    <h1> Your One Time Password (OTP) is : ${verficationCode}</h1>
    <P> This Code is for a limited time</P>
    <p> If you did not request for OTP kindly ignore this message, your account is safe with us</p>
    </body>
    </html>
    `

    await mail.mailService.sendEmail(email, subject, body)
}

const resetLinkMail = async (email, resentLink, username) => {
    const subject = 'Reset Link'
    const body = `<!DOCTYPE HTML>
    <html>
    <head>
    </head>
    <body>
    <h1>Verification</h1>
    <h1>Hello ${username}</h1>
    <h1> Your password reset link is : ${resentLink}</h1>
    <P> This link is for a limited time</P>
    <p> If you did not request for OTP kindly ignore this message, your account is safe with us</p>
    </body>
    </html>
    `

    await mail.mailService.sendEmail(email, subject, body)
}

module.exports = {
    registrationMail,
    verficationCodeMail,
    resetLinkMail
}