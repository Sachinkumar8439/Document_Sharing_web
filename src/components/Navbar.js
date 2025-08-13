import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faCogs, faEnvelope, faBars,faLogin } from "@fortawesome/free-solid-svg-icons";
// import "../components/Navbar.css"
import "../pages/landingpage.css"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#" className="navbar-logo">
           D-OCSAVE
        </a>
        <ul className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <li>
            <a href="#home">
              <FontAwesomeIcon icon={faHome} /> Home
            </a>
          </li>
          <li>
            <a href="#services">
              <FontAwesomeIcon icon={faCogs} /> Services
            </a>
          </li>
          <li>
            <a href="#contact">
              <FontAwesomeIcon icon={faEnvelope} /> Contact
            </a>
          </li>
          <li>
            <a href="/signin">
              <FontAwesomeIcon icon={faUser} /> Login
            </a>
          </li>
        </ul>
        <div className="navbar-toggle" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
