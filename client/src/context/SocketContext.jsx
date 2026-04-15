import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (isAuthenticated && user) {
            const socketInstance = io('http://localhost:5000', {
                transports: ['websocket'],
                reconnection: true
            });

            setSocket(socketInstance);

            socketInstance.on('connect', () => {
                console.log('Socket Connected:', socketInstance.id);
                socketInstance.emit('join_room', user._id || user.id);
            });

            // Global listeners logic can be handled individually by components
            // But we can show toast for generic notifications
            socketInstance.on('new_notification', (data) => {
                toast.success(`New Notification: ${data.message}`, { icon: '🔔' });
            });

            return () => {
                socketInstance.disconnect();
            };
        } else if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
