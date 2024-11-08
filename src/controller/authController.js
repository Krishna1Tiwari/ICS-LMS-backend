const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Otp } = require('../models/Otp');
const multer = require('multer');
const { generateOTP, sendEmailOTP } = require('../services/OtpService');
const {sendEmail}=require('../services/emailService')

// Send OTPs to both email and phone
exports.sendOTPs = async (req, res) => {
    const { email } = req.body;

    const emailOTP = generateOTP();
    const expiryTime = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes
    console.log(emailOTP);

    try {
        // Check if the email already exists in the users collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Remove any previous OTP records for the same email
        await Otp.deleteMany({ email });

        // Send OTP via email
        await sendEmailOTP(email, emailOTP);

        // Store new OTP and expiry in the database
        const otpData = new Otp({
            email,
            emailOTP,
            otpExpiry: new Date(expiryTime),
        });

        await otpData.save(); // Save the new OTP in MongoDB

        res.status(200).json({ data: { message: 'OTPs sent successfully' } });
    } catch (error) {
        console.error('Error sending OTPs:', error);
        res.status(500).json({ message: 'Error sending OTPs', error: error.message });
    }
};

// Verify OTPs for both email and phone and register the user
exports.verifyOTPsAndRegister = async (req, res) => {
    const { email, emailOTP, password, firstname, lastname } = req.body;

    // Log the incoming request body
    console.log('Request body:', req.body);

    // Validate the input fields
    if (!email || !emailOTP || !password || !firstname || !lastname) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const otpRecord = await Otp.findOne({ email });

        // Check if the OTP has expired
        if (!otpRecord || Date.now() > otpRecord.otpExpiry) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // Verify if the OTP matches (ensure both are strings)
        if (String(otpRecord.emailOTP) === String(emailOTP)) {
            // Delete the OTP record
            await Otp.deleteOne({ email });

            // Check if the user already exists
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ data: { message: 'User already exists.' } });
            }

            // Hash password and save the new user
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new User({
                email,
                password: hashedPassword,
                firstname,
                lastname,
            });

            await user.save();

            // Generate JWT token for the user
            const token = jwt.sign({ userId: user._id, role: 'user' }, process.env.SESSION_SECRET, { expiresIn: '1h' });

            // Optionally, you can return a temporary token here if needed
            const tempToken = jwt.sign({ email }, process.env.SESSION_SECRET, { expiresIn: '15m' });

            res.status(200).json({
                data: {
                    message: 'User registered successfully',
                    token,
                    tempToken,
                    userId: user._id,
                    role: 'user',
                },
            });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('Error verifying OTPs:', error);
        res.status(500).json({ message: 'Error verifying OTPs', error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log(email, password)
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: 'user' },
            process.env.SESSION_SECRET,
            { expiresIn: '1h' }
        );

        // Return token and user details
        res.json({ data: { token, userId: user._id, role: user.role } });

    } catch (error) {
        res.status(500).json({ data: { message: 'Server error', error: error.message } });
    }
};
// Register admin
exports.registerAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({ email });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const admin = new Admin({ email, password: hashedPassword });

        // Save admin to the database
        await admin.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return token and admin details
        res.status(201).json({ message: 'Admin registered successfully', token, userId: admin._id, role: 'admin' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.contactFormSubmit = async (req, res) => {
    try {
        // Extract fields from the request body
        const { name, email, phone, subject, message } = req.body;

        // Basic validation to ensure all required fields are present
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please provide all required fields: name, email, subject, and message.' });
        }

        // Prepare email data
        const emailData = {
            name,
            email,
            phone: phone || 'Not provided', // Handle optional phone field
            subject,
            message
        };

        // Call the sendEmail function to send the email
        const response = await sendEmail(emailData);

        // Check if email was sent successfully
        if (response.success) {
            return res.status(200).json({ data: { message: response.message } });
        } else {
            // Handle the case where the email was not sent successfully
            return res.status(500).json({ message: 'Failed to send email: ' + response.message });
        }
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({ message: 'An error occurred while submitting the contact form: ' + error.message });
    }
};
// Login admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return token and admin details
        res.json({ token, userId: admin._id, role: admin.role });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
