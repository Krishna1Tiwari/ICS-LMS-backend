// backend/models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin'],
        default: 'admin',
    },
}, {
    timestamps: true,
});

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
