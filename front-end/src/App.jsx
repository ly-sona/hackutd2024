// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Claims from './pages/Claims';
import Sidebar from './components/Sidebar';
import './App.css'; // Ensure this import is present

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
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