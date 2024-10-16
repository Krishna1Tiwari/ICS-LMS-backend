// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    registerAdmin, 
    loginAdmin,
    sendOTPs,
    verifyOTPsAndRegister ,
} = require('../../controller/authController');


// User registration and login routes
router.post('/login/user', loginUser);
// User Verification routes

// Admin registration and login routes
router.post('/register/admin', registerAdmin);
router.post('/login/admin', loginAdmin);

// OTP routes
router.post('/otp/send', sendOTPs);     // Route to send OTPs for email and WhatsApp
router.post('/otp/verify',verifyOTPsAndRegister ); // Route to verify the OTPs

module.exports = router;
