import React from "react";

const Header = () => {
  return (
    <header className="w-full bg-gray-800 p-4">
      <nav className="flex justify-end items-center max-w-6xl mx-auto">
        <ul className="flex space-x-6 text-white">
          <li className="hover:text-gray-300 cursor-pointer">Home</li>
          <li className="hover:text-gray-300 cursor-pointer">About</li>
          <li className="hover:text-gray-300 cursor-pointer">Services</li>
          <li className="hover:text-gray-300 cursor-pointer">Contact</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;