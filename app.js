const express = require('express')
const errorHandler = require('./Middleware/errorhandler')
const connect = require('./Config/connection')
const env = require('dotenv').config()
const morgan = require('morgan')
const auth = require('./googleOauth'); 
const passport = require('passport');
const session = require('express-session');
const app = express()



//database connection
connect()

//JSON parser
app.use(express.json())
app.use(morgan('tiny'))


//error handler 
app.use(errorHandler)

//API
app.use('/api/income', require('./Routes/incomeRoutes'))

// Add Google OAuth routes to your existing routing setup in app.js
app.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
    );

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected', // Redirect to protected route upon successful authentication
        failureRedirect: '/auth/google/failure' // Redirect to failure route upon authentication failure
    })
);

// Protected route, requires authentication
app.get('/auth/protected', isLoggedin, (req, res) => {
    let name = req.user.displayName; // Retrieve user's display name
    res.send(`Hello ${name}`); // Send greeting message
});

// Route for handling Google authentication failure
app.get('/auth/google/failure', (req, res) => {
    res.send('Something went wrong'); // Send error message
});

// Logout route
app.use('/auth/logout', (req, res) => {
    req.session.destroy(); // Destroy the session
    res.send('Goodbye'); // Send goodbye message
});

const PORT = process.env.PORT || 3005

//listen for port
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})