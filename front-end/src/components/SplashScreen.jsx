import React from 'react';
import './SplashScreen.css';
import LogoText from '../assets/LogoText.png';

function SplashScreen() {
  return (
    <div className="splash-screen">
      <img src={LogoText} alt="Logo" className="splash-logo" />
    </div>
  );
}

export default SplashScreen;