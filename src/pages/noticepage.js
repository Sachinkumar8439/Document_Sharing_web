import React from 'react';
import './noticepage.css';

const NoticePage = ({ heading, description, links }) => {
  return (
    <div className="notice-container">
      <div className="notice-content">
        <h1 className="notice-heading">{heading}</h1>
        <p className="notice-description">{description}</p>
        
        <div className="notice-links">
          {links?.map((link, index) => (
            <a 
              key={index}
              href={link.redirecturl}
              className="notice-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticePage;