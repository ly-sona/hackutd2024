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
            <NavLink to="/apply-loan" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Apply for Loan
            </NavLink>
          </li>
          <li>
            <NavLink to="/loan-history" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Loan History
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
