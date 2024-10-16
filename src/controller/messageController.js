// backend/controllers/messageController.js
const Message = require('../models/Message');

// Send message
exports.sendMessage = async (req, res) => {
    const { receiver, content } = req.body;
    try {
        const message = new Message({ sender: req.user.userId, receiver, content });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get messages
exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user.userId },
                { receiver: req.user.userId }
            ]
        }).populate('sender receiver', 'name email');
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
