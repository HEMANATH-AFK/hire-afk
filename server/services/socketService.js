let io;

const init = (socketIoInstance) => {
    io = socketIoInstance;

    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        // Join room based on user ID for private notifications
        socket.on('join_room', (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`[SOCKET] User ${userId} joined room`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });
};

const emitToUser = (userId, event, data) => {
    if (io) {
        console.log(`[SOCKET] Emitting ${event} to user ${userId}`);
        io.to(userId).emit(event, data);
    } else {
        console.error('[SOCKET-ERROR] IO instance not initialized');
    }
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    init,
    emitToUser,
    emitToAll
};
