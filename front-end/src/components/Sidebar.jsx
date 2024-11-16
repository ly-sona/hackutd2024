// Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
      <div
        className={`bg-gray-800 text-white transition-all duration-300 h-full ${
          isOpen ? 'w-64' : 'w-0'
        } overflow-hidden flex flex-col`}
      >
        {isOpen && (
          <>
            <button
              className="m-4 bg-gray-700 p-2 rounded self-end"
              onClick={toggleSidebar}
            >
              ✕
            </button>
            <nav className="p-4">
              <h1 className="text-xl font-bold mb-4">Navigation</h1>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="hover:text-gray-300">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/claims" className="hover:text-gray-300">
                    Claims
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="hover:text-gray-300">
                    Analytics
                  </Link>
                </li>
              </ul>
            </nav>
          </>
        )}
      </div>
    );
  };  

export default Sidebar;