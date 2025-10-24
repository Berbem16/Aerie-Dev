import React from 'react';
import './App.css';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">AERIE / DASHBOARD</h1>
        </div>
        <div className="header-right">
          <span className="welcome-text">Welcome Michael!</span>
          <button className="subscribe-btn">
            SUBSCRIBE TO EMAIL UPDATES
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
