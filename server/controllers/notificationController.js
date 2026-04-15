const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('sender', 'name company');

        res.status(200).json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check ownership
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ message: 'Marked as read', notification });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error marking notification as read' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error marking notifications as read' });
    }
};
