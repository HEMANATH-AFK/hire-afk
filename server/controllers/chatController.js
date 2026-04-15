const Message = require('../models/Message');
const User = require('../models/User');

exports.getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Ensure user is part of the chatId to prevent snooping
        if (!chatId.includes(req.user._id.toString())) {
             return res.status(403).json({ message: 'Not authorized to view this chat' });
        }

        const messages = await Message.find({ chatId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name role company')
            .populate('receiver', 'name role company');

        // Mark all unread messages in this chat as read for the current user
        await Message.updateMany(
            { chatId, receiver: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.status(200).json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        // Generate consistent chatId (alphabetical order to ensure uniqueness between two users)
        const chatId = [senderId.toString(), receiverId.toString()].sort().join('_');

        const message = new Message({
            chatId,
            sender: senderId,
            receiver: receiverId,
            content
        });

        await message.save();
        await message.populate('sender', 'name role company');

        // Emit socket event for real-time chat updates
        const socketService = require('../services/socketService');
        socketService.emitToUser(receiverId.toString(), 'new_message', message);
        socketService.emitToUser(senderId.toString(), 'new_message', message);

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

exports.getChatContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find all unique users this user has messaged
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).sort({ createdAt: -1 });

        const contactsMap = new Map();
        
        messages.forEach(msg => {
            const isSender = msg.sender.toString() === userId.toString();
            const contactId = isSender ? msg.receiver.toString() : msg.sender.toString();
            
            if (!contactsMap.has(contactId)) {
                contactsMap.set(contactId, {
                    contactId,
                    lastMessage: msg.content,
                    time: msg.createdAt,
                    unread: (!isSender && !msg.read) ? 1 : 0
                });
            } else if (!isSender && !msg.read) {
                const existing = contactsMap.get(contactId);
                existing.unread += 1;
            }
        });

        const contactIds = Array.from(contactsMap.keys());
        const users = await User.find({ _id: { $in: contactIds } }, 'name role company');

        const result = users.map(u => ({
            user: u,
            chatDetails: contactsMap.get(u._id.toString())
        })).sort((a, b) => new Date(b.chatDetails.time) - new Date(a.chatDetails.time));

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching contacts' });
    }
};
