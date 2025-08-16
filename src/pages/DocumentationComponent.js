import React, { useState, useEffect } from 'react';
import './DocumentationComponent.css';

const DocumentationComponent = ({ props }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(props.sections[0]?.id || '');

  useEffect(() => {
    // Handle window resize for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Check URL hash on initial load
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the #
      if (hash) {
        const validSection = props.sections.find(section => section.id === hash);
        if (validSection) {
          setActiveSection(hash);
        }
      } else if (props.sections.length > 0) {
        // Set default to first section if no hash
        setActiveSection(props.sections[0].id);
      }
    };

    handleResize();
    handleHashChange(); // Check hash on initial load
    
    // Set up event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [props.sections]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    // Update URL hash without page reload
    window.history.pushState(null, null, `#${sectionId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Scroll to active section when it changes
  useEffect(() => {
    if (activeSection) {
      const element = document.getElementById(activeSection);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeSection]);

  return (
    <div className="documentation-container">
      {isMobile && (
        <div className="mobile-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Documentation</h1>
        </div>
      )}

      <div className="documentation-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            {!isMobile && <h2>Documentation</h2>}
            {isMobile && (
              <button className="close-sidebar" onClick={toggleSidebar}>
                ×
              </button>
            )}
          </div>
          <nav>
            <ul className="section-list">
              {props?.sections.map((section) => (
                <li
                  key={section.id}
                  className={`section-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => handleSectionClick(section.id)}
                >
                  {section.title}
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="content">
          {props?.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={`content-section ${activeSection === section.id ? 'active' : ''}`}
            >
              <h2>{section.title}</h2>
              {section.content.map((item, index) => (
                <div key={index} className="content-block">
                  {item.heading && <h3>{item.heading}</h3>}
                  {item.paragraph && <p>{item.paragraph}</p>}
                  {item.listItems && (
                    <ul className="content-list">
                      {item.listItems.map((listItem, itemIndex) => (
                        <li key={itemIndex}>{listItem}</li>
                      ))}
                    </ul>
                  )}
                  {item.link && (
                    <div className="content-link">
                      <a href={item.link.url} target="_blank" rel="noopener noreferrer">
                        {item.link.text}
                      </a>
                    </div>
                  )}
                  {item.links && (
                    <ul className="content-links">
                      {item.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          ))}
        </main>
      </div>

      {/* Footer */}
      <footer className="documentation-footer">
        <div className="footer-content">
          {props?.footerData.links && (
            <div className="footer-links">
              <h3>{props.footerData.title || 'Links'}</h3>
              <ul>
                {props.footerData.links.map((link, index) => (
                  <li key={index}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {props.footerData.advertisement && (
            <div className="footer-ad">
              <h3>{props.footerData.advertisement.title}</h3>
              <p>{props.footerData.advertisement.text}</p>
              {props.footerData.advertisement.link && (
                <a
                  href={props.footerData.advertisement.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ad-link"
                >
                  {props.footerData.advertisement.link.text}
                </a>
              )}
            </div>
          )}
          <div className="footer-copyright">
            <p>{props.footerData.copyright || '© 2023 Documentation. All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentationComponent;