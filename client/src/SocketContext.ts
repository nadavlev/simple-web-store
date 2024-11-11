// src/SocketContext.ts
import React from 'react';

const SocketContext = React.createContext<WebSocket | null>(null);

export default SocketContext;