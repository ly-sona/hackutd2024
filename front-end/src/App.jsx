// src/App.jsx

import { useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import throttle from 'lodash.throttle';
import Dashboard from './pages/Dashboard';
import ApplyLoan from './pages/ApplyLoan';
import LoanHistory from './pages/LoanHistory';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const mainContentRef = useRef(null);

  const handleMouseMove = useCallback(
    throttle((e) => {
      if (mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCursorPos({ x, y });
      }
    }, 50),
    []
  );

  const calculateGradient = () => {
    const { x, y } = cursorPos;
    const lightGreen = 'rgba(123, 156, 133, 0.5)';
    const darkGreen = 'rgba(46, 66, 52, 0.8)';
    return `radial-gradient(circle at ${x}% ${y}%, ${lightGreen} 0%, ${darkGreen} 100%)`;
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar isVisible={isSidebarVisible} />
        <button
          className="toggle-sidebar-btn"
          onClick={() => setIsSidebarVisible((prev) => !prev)}
        >
          {isSidebarVisible ? '❮' : '❯'}
        </button>
        <div
          className={`main-content ${isSidebarVisible ? '' : 'full-width'}`}
          ref={mainContentRef}
          onMouseMove={handleMouseMove}
          style={{ background: calculateGradient() }}
        >
          <div className="content-overlay">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/apply-loan" element={<ApplyLoan />} />
              <Route path="/loan-history" element={<LoanHistory />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
