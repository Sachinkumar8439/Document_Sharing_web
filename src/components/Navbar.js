import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faCogs, faEnvelope, faBars,faLogin } from "@fortawesome/free-solid-svg-icons";
import "../pages/landingpage.css"
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <span className="navbar-logo">
           D-OCSAVE
        </span>
        <ul className={`navbar-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <li>
            <Link to={'/'} href="#home">
              <FontAwesomeIcon icon={faHome} /> Home
            </Link>
          </li>
          <li>
            <Link to={'/services'} href="#services">
              <FontAwesomeIcon icon={faCogs} /> Services
            </Link>
          </li>
          <li>
            <Link to={'/contact'} href="#contact">
              <FontAwesomeIcon icon={faEnvelope} /> Contact
            </Link>
          </li>
          <li>
            <Link to={'signin'} >
              <FontAwesomeIcon icon={faUser} /> Login
            </Link>
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
