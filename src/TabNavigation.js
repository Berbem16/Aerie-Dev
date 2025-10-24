import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaEye, 
  FaStar,
  FaCog,
  FaFileAlt
} from 'react-icons/fa';
import './App.css';

const TabNavigation = () => {
  const location = useLocation();

  return (
    <nav className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <FaStar className="logo-icon" />
              <span className="logo-text">AERIE</span>
            </div>
          </div>
      
      <div className="sidebar-nav">
        <Link 
          to="/" 
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          <FaHome className="nav-icon" />
          <span className="nav-text">REPORT</span>
          <span className="nav-arrow">›</span>
        </Link>
        
        <Link 
          to="/sightings" 
          className={`nav-item ${location.pathname === '/sightings' ? 'active' : ''}`}
        >
          <FaEye className="nav-icon" />
          <span className="nav-text">SIGHTINGS</span>
          <span className="nav-arrow">›</span>
        </Link>
        
            <Link 
              to="/analysis" 
              className={`nav-item ${location.pathname === '/analysis' ? 'active' : ''}`}
            >
              <FaFileAlt className="nav-icon" />
              <span className="nav-text">ANALYSIS</span>
              <span className="nav-arrow">›</span>
            </Link>
        
        <Link 
          to="/admin" 
          className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
        >
          <FaCog className="nav-icon" />
          <span className="nav-text">ADMIN</span>
          <span className="nav-arrow">›</span>
        </Link>
      </div>
      
      <div className="sidebar-footer">
        <div className="ai-icon-container">
          <img 
            src="/ai-icon.svg" 
            alt="AI Icon" 
            className="ai-icon-image"
            onError={(e) => {
              // Fallback to text if image doesn't load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="ai-icon-fallback" style={{display: 'none'}}>
            <div className="ai-icon">AI</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;
