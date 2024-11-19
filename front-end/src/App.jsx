import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import throttle from 'lodash.throttle';
import anime from 'animejs';
import CusInfo from './pages/CusInfo';
import Home from './pages/Home';
import LoanRisk from './pages/LoanRisk';
import Default from './pages/Default';
import Sidebar from './components/Sidebar';
import SplashScreen from './components/SplashScreen';
import './App.css';

function App() {
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const mainContentRef = useRef(null);

  useEffect(() => {
    anime({
      targets: '.splash-logo',
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeInOutQuad',
      complete: () => {
        setTimeout(() => {
          anime({
            targets: '.splash-screen',
            opacity: [1, 0],
            duration: 1000,
            easing: 'easeInOutQuad',
            complete: () => {
              setIsSplashVisible(false);
            },
          });
        }, 2000);
      },
    });
  }, []);

  const handleMouseMove = useRef(
    throttle((e) => {
      if (mainContentRef.current) {
        const rect = mainContentRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCursorPos({ x, y });
      }
    }, 50)
  ).current;

  const calculateGradient = () => {
    const { x, y } = cursorPos;
    const lightPurple = 'rgba(46, 41, 77, 1)';
    const darkPurple = 'rgba(38, 34, 64, 1)';
    return `radial-gradient(circle at ${x}% ${y}%, ${lightPurple} 0%, ${darkPurple} 100%)`;
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

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
              <Route path="/" element={<Home />} />
              <Route path="/CusInfo" element={<CusInfo />} />
              <Route path="/loan-risk" element={<LoanRisk />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
