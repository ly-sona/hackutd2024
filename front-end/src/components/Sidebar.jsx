// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ isVisible }) {
  return (
    <div className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
      <nav className="navbar">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Analytics
            </NavLink>
          </li>
          <li>
            <NavLink to="/claims" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Claims
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
