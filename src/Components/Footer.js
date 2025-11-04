import React from 'react';
import './Footer.css';
import { FaFacebookF, FaXTwitter, FaYoutube } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="zeetravelo-footer">
      <div className="footer-sections">
        <div className="footer-group">
          <h5>Company</h5>
          <ul>
            <li>About Us</li>
            <li>Careers</li>
            <li>Blog</li>
            <li>Mobile App</li>
            <li>How ZeeTravelo Works</li>
          </ul>
        </div>

        <div className="footer-group">
          <h5>Support</h5>
          <ul>
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>Affiliate Program</li>
            <li>Partner With Us</li>
            <li>Advertise on ZeeTravelo</li>
          </ul>
        </div>

        <div className="footer-group">
          <h5>Resources</h5>
          <ul>
            <li>Travel Guides</li>
            <li>Popular Destinations</li>
            <li>Flight Deals</li>
            <li>Travel Insurance</li>
            <li>Safety Tips</li>
          </ul>
        </div>

        <div className="footer-group app-section">
  <h5>Get the App</h5>
  <div className="app-buttons">
    <a href="#" target="_blank" rel="noreferrer">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
        alt="Get it on Google Play"
      />
    </a>
    <a href="#" target="_blank" rel="noreferrer">
      <img
        src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
        alt="Download on the App Store"
/>
    </a>
  </div>
</div>


      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <div className="footer-legal">
          <p>© 2025 ZeeTravelo. All rights reserved.</p>
          <ul>
            <li>Cookie Settings</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
            <li>Legal Info</li>
          </ul>
        </div>

        <div className="footer-social-language">
          <div className="footer-social-icons">
            <FaFacebookF />
            <FaXTwitter />
            <FaYoutube />
          </div>
          <div className="footer-language">
            English | £ GBP
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
