import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          RabbitMQ Image Processor Dashboard | 
          Built with React, Node.js & RabbitMQ
        </p>
        <div className="footer-links">
          <span>Status: </span>
          <span className="status-live">● Live</span>
          <span> | Version: 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;