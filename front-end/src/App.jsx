// App.jsx
import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Claims from './pages/Claims';
import Analytics from './pages/Analytics';

function App() {
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 50, y: 50 });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is open by default

  // Handle mouse movement for dynamic background
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100; // Convert to percentage
      const y = (clientY / window.innerHeight) * 100;
      setBackgroundPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Function to toggle the sidebar's open state
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      {/* Toggle Button (Visible when Sidebar is Closed) */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded"
        >
          ☰
        </button>
      )}

      <div
        className="flex flex-row w-full"
        style={{
          background: `radial-gradient(circle at ${backgroundPosition.x}% ${backgroundPosition.y}%, #1d2c2f, #065f46)`,
          transition: 'background 0.1s ease',
        }}
      >
        {/* Sidebar */}
        <div className={`flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;