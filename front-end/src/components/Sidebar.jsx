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
      <div className="navbar-container">
        <div className="logo-container">
          <img src={LogoText} alt="Logo" className="logo" />
        </div>
        <nav className="navbar">
          <ul>
          <li>
              <NavLink to="/" className="text-lg font-bold" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/CusInfo" className="text-lg font-bold" end>
                Customer Information
              </NavLink>
            </li>
            <li>
              <NavLink to="/loan-risk" className="text-lg font-bold" end>
              Loan Approval Risk
              </NavLink>
            </li>
            <li>
              <NavLink to="/default" className="text-lg font-bold" end>
              Default Risk
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
