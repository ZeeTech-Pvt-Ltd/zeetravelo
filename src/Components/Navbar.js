import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import {
  FaPlane, FaBed, FaCar, FaShip, FaTags,
  FaCompass, FaLightbulb, FaRoute, FaClock,
  FaBriefcase, FaLock, FaSuitcase, FaBars, FaTimes, FaClipboardList
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Top Navbar */}
      <div className="top-navbar d-flex align-items-center justify-content-start px-3 gap-3">

        <div className="hamburger-icon" onClick={toggleSidebar}>
          <FaBars size={24} />
        </div>
        

<Link to="/" className="navbar-brand-text fw-bold text-primary" style={{ paddingLeft: '50px', paddingTop: '10px', textDecoration: 'none' }}>
  ZeeTravelo
</Link>

      </div>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`sidebar bg-white shadow-sm ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header d-flex justify-content-between align-items-center px-3 py-3">
          <span className="fw-bold text-primary">ZeeTravelo</span>
          <FaTimes className="close-icon" onClick={toggleSidebar} />
        </div>

        <nav className="nav flex-column">
          <NavLink to="/flights" className="nav-link" onClick={closeSidebar}><FaPlane className="me-2" /> Flights</NavLink>
          <NavLink to="/hotels" className="nav-link" onClick={closeSidebar}><FaBed className="me-2" /> Hotels</NavLink>
          <NavLink to="/cars" className="nav-link" onClick={closeSidebar}><FaCar className="me-2" /> Cars</NavLink>
          <NavLink to="/cruise" className="nav-link" onClick={closeSidebar}><FaShip className="me-2" /> Cruise</NavLink>
          <NavLink to="/deals" className="nav-link" onClick={closeSidebar}><FaTags className="me-2" /> Deals</NavLink><hr />
          <NavLink to="/explore" className="nav-link" onClick={closeSidebar}><FaCompass className="me-2" /> Explore</NavLink>
          <NavLink to="/tips" className="nav-link" onClick={closeSidebar}><FaLightbulb className="me-2" /> Travel Tips</NavLink>
          <NavLink to="/direct" className="nav-link" onClick={closeSidebar}><FaRoute className="me-2" /> Direct</NavLink>
          <NavLink to="/time" className="nav-link" onClick={closeSidebar}><FaClock className="me-2" /> Best Time</NavLink>
          <NavLink to="/business" className="nav-link" onClick={closeSidebar}><FaBriefcase className="me-2" /> Business</NavLink><hr />
          <NavLink to="/privacy" className="nav-link" onClick={closeSidebar}><FaLock className="me-2" /> Privacy</NavLink>
          <NavLink to="/trips" className="nav-link" onClick={closeSidebar}><FaSuitcase className="me-2" /> Trips</NavLink>
          <NavLink to="/display-order" className="nav-link" onClick={closeSidebar}><FaClipboardList className="me-2" /> Get Details</NavLink>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
