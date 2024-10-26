import React from 'react';
import '../styling/homepage.css';
import '../pages/icon.png';
import styled from "styled-components";
import "./minilogo.png";

const Header = (props) => {
  return (
    <Container>
      <Logo>
        <a href="/">
          <img src={require("./minilogo.png")} alt="icon" />
        </a>
      </Logo>
      <NavMenu>
        <a href="/">
          <span>Home</span>
        </a>
        <a href="/about">
          <span>About us</span>
        </a>
        <a href="/contact">
          <span>Contact us</span>
        </a>
      </NavMenu>
      <Login>Login</Login>
    </Container>
  );
};

//Styled-Components

const Container = styled.div`
  position: fixed;
  background-color: #F0F8FF;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: space-between;
  padding: 0 30px;
  align-items: center;
  z-index: 1000;
`;

const Logo = styled.a`
  /* padding: 0; */
  width: 80px;
  /* font-size: 0; */
  /* display: inline-block; */
  align-items: center;

  a {
    cursor: auto;
    img {
      /* display: flex; */
      width: 90%;
      border-radius: 50px;
      /* align-items: center; */
    }
  }
`;

const Wrap = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  position: relative;
  margin-right: auto;
  margin-left: auto;
`;

const NavMenu = styled.div`
  align-items: center;
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  justify-content: flex-end;
  margin: 0;
  padding: 0;
  position: relative;
  margin-right: 30px;
  margin-left: auto;

  a {
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 0 12px;

    span {
      color: rgb(2,0,36);
      font-size: 18px;
      letter-spacing: 1px;
      line-height: 1.08;
      padding: 1px 0;
      white-space: nowrap;
      position: relative;

      &:before {
        background-color: rgb(255, 255, 255);
        border-radius: 0 0 4px 4px;
        bottom: -6px;
        content: "";
        height: 2px;
        left: 0;
        opacity: 0;
        position: absolute;
        right: 0;
        transform-origin: left center;
        transform: scaleX(0);
        transition: all 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 0s;
        visibility: hidden;
        width: auto;
      }
    }

    &:hover {
      span:before {
        transform: scaleX(1);
        visibility: visible;
        opacity: 1 !important;
      }
    }
  }

  @media (max-width: 548px) {
    display: none;
  }
`;

const Login = styled.a`
  color: #000000;
  background-color: rgba(255, 255, 255, 255);
  padding: 10px 16px;
  margin-right: 45px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  border: 2px solid #05051c;
  border-radius: 4px;
  transition: all 0.2s ease 0s;

  &:hover {
    background-color: #05051c;
    color: #000;

  }
`;

export default Header;