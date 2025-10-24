import React from 'react';
import { useLocation } from 'react-router-dom';
import './App.css';

const Header = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'AERIE / REPORT';
      case '/sightings':
        return 'AERIE / SIGHTINGS';
      case '/admin':
        return 'AERIE / ADMIN';
      default:
        return 'AERIE / DASHBOARD';
    }
  };

  return (
    <header className="main-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
        <div className="header-right">
          <span className="welcome-text">Welcome Michael!</span>
          <button className="logout-btn">
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
