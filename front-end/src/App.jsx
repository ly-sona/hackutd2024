// src/App.jsx
import { useState, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import throttle from 'lodash.throttle'; // Optional: For throttling
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Claims from './pages/Claims';
import Sidebar from './components/Sidebar';
import './App.css'; // Ensure this import is present

function App() {
  // State to track cursor position as percentages relative to main-content
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 }); // Default center
  const mainContentRef = useRef(null);

  // Handler for mouse movement with throttling (optional)
  const handleMouseMove = useCallback(
    throttle((e) => {
      if (mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCursorPos({ x, y });
      }
    }, 50), // Throttle to once every 50ms
    []
  );

  // Calculate radial gradient based on cursor position
  const calculateGradient = () => {
    const { x, y } = cursorPos;
    // Define subtle light and dark forest green colors with transparency
    const lightGreen = 'rgba(123, 156, 133, 0.5)'; // Subtle Medium Aquamarine with 50% opacity
    const darkGreen = 'rgba(46, 66, 52, 0.8)';     // Forest Green with 80% opacity
    return `radial-gradient(circle at ${x}% ${y}%, ${lightGreen} 0%, ${darkGreen} 100%)`;
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div
          className="main-content"
          ref={mainContentRef}
          onMouseMove={handleMouseMove}
          style={{ background: calculateGradient() }}
        >
          <div className="content-overlay">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/claims" element={<Claims />} />
              {/* Add more routes as needed */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;