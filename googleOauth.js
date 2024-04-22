const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;

// Configure Passport to use Google OAuth2 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Google OAuth2 client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google OAuth2 client secret
    callbackURL: "http://localhost:3006/auth/google/callback", // Callback URL after authentication
    passReqToCallback: true // Pass request object to the callback function
}, function(request, accessToken, refreshToken, profile, done) {
    // Callback function to handle Google OAuth2 authentication
    done(null, profile); // Pass the user profile to the done callback
}));

// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user); // Store the entire user object in the session
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
    done(null, user); // Retrieve the user object from the session
});
