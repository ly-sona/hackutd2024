import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import anime from 'animejs';
import './Sidebar.css';
import LogoText from '../assets/LogoText.png';

function Sidebar({ isVisible }) {
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      anime({
        targets: sidebarRef.current,
        translateX: [ -250, 0 ],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    } else {
      anime({
        targets: sidebarRef.current,
        translateX: [0, -250],
        opacity: [1, 0],
        duration: 500,
        easing: 'easeInQuad',
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={sidebarRef}
      className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}
    >
      <div className="logo-container">
        <img src={LogoText} alt="Logo" className="logo" />
      </div>
      <nav className="navbar">
        <ul>
        <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" end>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/apply-loan">
              Apply for Loan
            </NavLink>
          </li>
          <li>
            <NavLink to="/loan-history">
              Loan History
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
