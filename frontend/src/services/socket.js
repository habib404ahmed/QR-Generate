import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('[Socket.IO] Connected to backend live update server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('[Socket.IO] Disconnected from backend server');
});
