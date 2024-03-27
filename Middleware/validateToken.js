const asyncHandler = require('express-async-handler')
const jwt = require('jsonwebtoken')

// Define a middleware function to validate JWT token
const validateToken = asyncHandler(async (req, res, next) => {
    let token
    let authHeader = req.headers.authorization

    // Check if Authorization header exists and starts with 'Bearer'
    if(authHeader && authHeader.startsWith('Bearer')) {
        // Extract token from Authorization header
        token = authHeader.split(' ')[1]

        // Verify the token using the ACCESS_KEY from environment variables
        jwt.verify(token, process.env.ACCESS_KEY, (err, decoded) => {
            if(err) {
                // If token verification fails, send Unauthorized response
                res.status(401).json({ message: 'Unauthorized, please log in'})
            }
            // If token verification succeeds, attach decoded user information to request object
            req.user = decoded.user
            // Call the next middleware function
            next()
        });
    } else {
        // If Authorization header is missing or does not start with 'Bearer', send Unauthorized response
        res.status(401).json({ message: 'User is not authorized'})
    }
});


module.exports = validateToken
