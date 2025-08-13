import React, {} from 'react';
import { Mail, Shield, FileText, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import "./Hero.css"

const Hero = ({ onSignIn, onSignUp }) => {
  const navigate = useNavigate(); 

  return (
    <section className="hero">
      {/* Background Elements */}
      <div className="hero-bg">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Shield size={16} />
            <span>Aadhaar-Linked Security</span>
          </div>
          
          <h1 className="hero-heading">
            Securely Store & Share
            <span className="gradient-text"> Your Documents</span>
          </h1>
          
          <p className="hero-description">
            Experience a safe, efficient, and hassle-free way to manage your
            important documents digitally. Access them anytime, anywhere, with
            enterprise-grade security.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <FileText size={20} />
              <span>Digital Storage</span>
            </div>
            <div className="feature-item">
              <Shield size={20} />
              <span>Bank-Level Security</span>
            </div>
            <div className="feature-item">
              <Zap size={20} />
              <span>Instant Access</span>
            </div>
          </div>

          <div className="hero-buttons">
            <button 
              onClick={(e) => {
                e.preventDefault();
                navigate("/signin")
              }}
              className="btn btn-primary"
            >
              <span>Access Your Account</span>
              <ArrowRight size={18} />
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate("/signupWithEmail")
              }}
              className="btn btn-secondary"
            >
              <Mail size={18} />
              <span>Continue with Email</span>
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-container">
            <div className="document-stack">
              <div className="document doc-1">
                <div className="doc-header"></div>
                <div className="doc-content">
                  <div className="doc-line"></div>
                  <div className="doc-line short"></div>
                  <div className="doc-line"></div>
                </div>
              </div>
              <div className="document doc-2">
                <div className="doc-header"></div>
                <div className="doc-content">
                  <div className="doc-line"></div>
                  <div className="doc-line"></div>
                  <div className="doc-line short"></div>
                </div>
              </div>
              <div className="document doc-3">
                <div className="doc-header"></div>
                <div className="doc-content">
                  <div className="doc-line"></div>
                  <div className="doc-line short"></div>
                  <div className="doc-line"></div>
                </div>
              </div>
            </div>
            
            <div className="security-badge">
              <Shield size={24} />
              <span>Secured</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;