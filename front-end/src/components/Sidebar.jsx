// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <nav className="navbar">
        <ul>
          <li>
            <NavLink  
              to="/"
              end
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink  
              to="/analytics"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink  
              to="/claims"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              Claims
            </NavLink>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;