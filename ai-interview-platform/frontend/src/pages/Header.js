import React from 'react';
import { Link } from 'react-router-dom'; // Using Link for better navigation
import '../styling/header.css';
import './minilogo.png';

const Header = () => {
  return (
    <header className="header-container">
      <Link to="/" className="header-logo">
        <img src={require("./minilogo.png")} alt="Company Logo" />
      </Link>
      <nav className="header-nav">
        <Link to="/">
          <span>Home</span>
        </Link>
        <Link to="/about">
          <span>About</span>
        </Link>
        <Link to="/contact">
          <span>Contact</span>
        </Link>
      </nav>
      <Link to="/login" className="header-login">
        Login
      </Link>
    </header>
  );
};


export default Header;