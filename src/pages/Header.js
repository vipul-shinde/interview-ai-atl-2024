import React from 'react';
import '../styling/header.css';
import './minilogo.png';

const Header = () => {
  return (
    <div className="header-container">
      <div className="header-logo">
        <a href="/">
          <img src={require("./minilogo.png")} alt="icon" />
        </a>
      </div>
      <div className="header-nav">
        <a href="/">
          <span>Home</span>
        </a>
        <a href="/about">
          <span>About us</span>
        </a>
        <a href="/contact">
          <span>Contact us</span>
        </a>
      </div>
      <a href="/login" className="header-login">Login</a>
    </div>
  );
};

export default Header;