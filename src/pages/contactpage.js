import React, { useState } from 'react';
import './contactpage.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1000);
  };

  return (
    <div className="contact-container">
      <h2 className="contact-title">Contact Us</h2>
      <p style={{color:"red"}}>not comppleted yet DONT SUBMIT FORM</p>
      
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="4"
          />
        </div>
        
        {submitStatus === 'success' && (
          <div className="form-success">✓ Message sent!</div>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
        
      </form>
      
      <div className="contact-info">
        <div className="info-item">
          <h3>📍 Location</h3>
          <p>Indian Institute of Technology Varanasi <br/> (IIT BHU)</p>
        </div>
        
        <div className="info-item">
          <h3>📞 Phone</h3>
          <p>+1 (555) 123-4567</p>
        </div>
        
        <div className="info-item">
          <h3>✉️ Email</h3>
          <p>support@DocStore.com</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;