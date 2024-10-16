const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true },
    emailOTP: { type: String, required: true },
    otpExpiry: { type: Date, required: true }
});

const Otp = mongoose.model('Otp', otpSchema);
module.exports = {Otp};
