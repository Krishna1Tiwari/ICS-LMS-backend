const nodemailer = require('nodemailer');
// const axios = require('axios');
// const https = require('https');

// Generate OTP (6-digit random number)
exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
};

// Send OTP via Email
exports.sendEmailOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Registration',
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email OTP sent to ${email}`);
    } catch (error) {
        console.error('Error sending email OTP:', error.message);
        throw new Error('Could not send OTP via email');
    }
};
// Send OTP via WhatsApp
// exports.sendWhatsAppOTP = async (phoneno, otp) => {
//     try {
//         const agent = new https.Agent({  
//             rejectUnauthorized: false // Ignore SSL certificate issues (not safe for production)
//         });

//         const response = await axios.post('https://wp.easyrechargesolution.com/api/create-message', {
//             appkey: '9dc404d8-834d-48fa-8b44-b72dab07997d', // API key
//             authkey: 'rrJlUE0oKsl394cHRTrzJTB383B2Gg2lqQEip2tIpdHSx1Lz9s', // Auth key
//             to: phoneno, // WhatsApp phone number to send OTP
//             message: `Your OTP is ${otp}. It is valid for 5 minutes.` // OTP message content
//         },
//         { httpsAgent: agent } // Add the agent to bypass SSL errors
//     );

//         console.log(`WhatsApp OTP sent to ${phoneno}`);
//         return response.data; // Optionally, return the API response
//     } catch (error) {
//         console.error('Error sending WhatsApp OTP:', error.message);
//         throw new Error('Could not send OTP via WhatsApp');
//     }
// };
