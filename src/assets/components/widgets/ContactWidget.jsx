import React from 'react';
import { FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';
import './ContactWidget.css';

const ContactWidget = () => (
  <div className="contact-widget">
    <h3>Contact Information</h3>
    <div className="contact-items">
      <a
        href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-item"
      >
        <FaInstagram className="contact-icon instagram" />
        <div className="contact-details">
          <h4>Instagram</h4>
        </div>
      </a>
      <a
        href="mailto:Solsparrowhq@gmail.com"
        className="contact-item"
      >
        <FaEnvelope className="contact-icon email" />
        <div className="contact-details">
          <h4>Email</h4>
        </div>
      </a>
      <div className="contact-item">
        <FaPhone className="contact-icon phone" />
        <div className="contact-details">
          <h4>Phone 1 (Hyderabad)</h4>
          <span className="contact-text">+91 90591 71196</span>
        </div>
      </div>
      <div className="contact-item">
        <FaPhone className="contact-icon phone" />
        <div className="contact-details">
          <h4>Phone 2 (Pune)</h4>
          <span className="contact-text">+91 63595 52530</span>
        </div>
      </div>
    </div>
  </div>
);

export default ContactWidget; 