import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import RecentSightings from './RecentSightings';
import TabNavigation from './TabNavigation';
import Header from './Header';

function App() {
  return (
    <Router>
      <div className="App">
        <TabNavigation />
        <div className="main-content">
          <Header />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sightings" element={<RecentSightings />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;