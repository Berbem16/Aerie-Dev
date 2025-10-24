import React from 'react';
import { FaBrain, FaChartLine, FaLightbulb } from 'react-icons/fa';
import './App.css';

const Analysis = () => {
  return (
    <div className="analysis-page">
      <main className="App-main">
        <div className="analysis-container">
          <div className="analysis-header">
            <div className="analysis-icon">
              <FaBrain />
            </div>
            <h1>AI-Powered Analysis</h1>
            <p className="analysis-subtitle">
              Advanced LLM-driven insights and intelligence for UAS sightings
            </p>
          </div>

          <div className="analysis-content">
            <div className="coming-soon-card">
              <div className="coming-soon-icon">
                <FaRobot />
              </div>
              <h2>Coming Soon</h2>
              <p>
                We're developing an advanced AI analysis system powered by Large Language Models (LLMs) 
                to provide intelligent insights into UAS sighting patterns, threat assessments, and 
                operational intelligence.
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaChartLine />
                </div>
                <h3>Pattern Analysis</h3>
                <p>
                  AI-powered analysis of sighting patterns, frequency trends, and geographic 
                  distribution to identify potential threats and operational insights.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FaLightbulb />
                </div>
                <h3>Intelligence Reports</h3>
                <p>
                  Automated generation of intelligence reports with threat assessments, 
                  recommendations, and actionable insights based on sighting data.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FaBrain />
                </div>
                <h3>Predictive Analytics</h3>
                <p>
                  Machine learning models to predict potential UAS activity, identify 
                  high-risk areas, and provide early warning capabilities.
                </p>
              </div>

            </div>

            <div className="development-status">
              <h3>Development Status</h3>
              <div className="status-timeline">
                <div className="status-item completed">
                  <div className="status-dot"></div>
                  <div className="status-content">
                    <h4>Data Collection</h4>
                    <p>UAS sighting data collection and storage system</p>
                  </div>
                </div>
                <div className="status-item completed">
                  <div className="status-dot"></div>
                  <div className="status-content">
                    <h4>Unit Tracking</h4>
                    <p>ASCC and unit-based reporting and search capabilities</p>
                  </div>
                </div>
                <div className="status-item in-progress">
                  <div className="status-dot"></div>
                  <div className="status-content">
                    <h4>LLM Integration</h4>
                    <p>Large Language Model integration for intelligent analysis</p>
                  </div>
                </div>
                <div className="status-item pending">
                  <div className="status-dot"></div>
                  <div className="status-content">
                    <h4>Advanced Analytics</h4>
                    <p>Predictive modeling and automated intelligence reports</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3>Stay Updated</h3>
              <p>
                The AI Analysis module is currently in development. Contact your system administrator 
                for updates on the release timeline and feature availability.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
