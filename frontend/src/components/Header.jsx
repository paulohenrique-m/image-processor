import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import './Header.css';

const Header = () => {
  const { isConnected } = useWebSocket();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">
          Image Processor
        </h1>
        <div className="header-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;