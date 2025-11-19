import { useEffect, useRef, useState } from 'react';
import { socketService } from '../services/socket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    socketService.connect();

    socketService.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketService.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const subscribeToJobUpdates = (callback) => {
    socketService.on('job_status_update', callback);

    return () => {
      socketService.off('job_status_update', callback);
    };
  };

  const subscribeToMetrics = (callback) => {
    socketService.on('metrics_update', callback);
    
    return () => {
      socketService.off('metrics_update', callback);
    };
  };

  return {
    isConnected,
    lastMessage,
    subscribeToJobUpdates,
    subscribeToMetrics,
    emit: socketService.emit,
  };
};