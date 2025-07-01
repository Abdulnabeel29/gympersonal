import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  FaTachometerAlt, FaUsers, FaCalendarAlt, FaBoxOpen, FaDollarSign, 
  FaCog, FaChartLine, FaUserTie, FaQuestionCircle, FaSun, FaMoon, FaBars, FaTimes, FaChevronDown, FaChevronRight,
  FaInstagram, FaEnvelope, FaDumbbell
} from "react-icons/fa";
import { useTheme } from '../../data/ThemeContext';

const Sidebar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [financesOpen, setFinancesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const handleToggle = () => setIsOpen(!isOpen);
  const toggleFinances = () => setFinancesOpen(!financesOpen);
  const toggleContact = () => setContactOpen(!contactOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { to: "/", icon: <FaTachometerAlt />, text: "Dashboard" },
    { to: "/members", icon: <FaUsers />, text: "Members" },
    { to: "/staff", icon: <FaUserTie />, text: "Staff" },
    { to: "/inventory", icon: <FaBoxOpen />, text: "Inventory" },
    { to: "/schedule", icon: <FaCalendarAlt />, text: "Schedule" },
    { to: "/insights", icon: <FaChartLine />, text: "Business Insights" },
    { to: "/enquiries", icon: <FaQuestionCircle />, text: "Enquiries" },
  ];
  
  const closeSidebarOnMobile = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && window.innerWidth <= 768 && (
        <div className="sidebar-backdrop" onClick={handleToggle}></div>
      )}
      
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <FaDumbbell />
            </div>
            <h1 className="logo">GymSoft</h1>
          </div>
          <button className="close-btn" onClick={handleToggle}>
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN MENU</div>
          {navLinks.map(link => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              onClick={closeSidebarOnMobile}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <div className="nav-icon">{link.icon}</div>
              <span className="nav-text">{link.text}</span>
              <div className="nav-indicator"></div>
            </NavLink>
          ))}
          
          <div className="nav-section-title">FINANCIAL</div>
          {/* Finances Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn" onClick={toggleFinances}>
              <div className="nav-icon">
                <FaDollarSign />
              </div>
              <span className="nav-text">Finances</span>
              <div className={`dropdown-arrow ${financesOpen ? 'open' : ''}`}>
                <FaChevronRight />
              </div>
            </button>
            <div className={`nav-dropdown-content ${financesOpen ? 'open' : ''}`}>
              <NavLink 
                to="/finances/view" 
                onClick={closeSidebarOnMobile}
                className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'}
              >
                <span className="dropdown-text">View Finances</span>
              </NavLink>
              <NavLink 
                to="/finances/add" 
                onClick={closeSidebarOnMobile}
                className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'}
              >
                <span className="dropdown-text">Add Finance</span>
              </NavLink>
              <NavLink 
                to="/finances/recurring" 
                onClick={closeSidebarOnMobile}
                className={({ isActive }) => isActive ? 'dropdown-item active' : 'dropdown-item'}
              >
                <span className="dropdown-text">Recurring Transactions</span>
              </NavLink>
            </div>
          </div>

          <div className="nav-section-title">SUPPORT</div>
          {/* Help Link */}
          <NavLink 
            to="/help" 
            onClick={closeSidebarOnMobile} 
            className={({ isActive }) => isActive ? 'nav-item help-link active' : 'nav-item help-link'}
          >
            <div className="nav-icon">
              <FaQuestionCircle />
            </div>
            <span className="nav-text">Help & Guide</span>
            <div className="nav-indicator"></div>
          </NavLink>

          {/* Contact Us Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn" onClick={toggleContact}>
              <div className="nav-icon">
                <FaEnvelope />
              </div>
              <span className="nav-text" style={{paddingLeft:"12px"}}>Contact Us</span>
              <div className={`dropdown-arrow ${contactOpen ? 'open' : ''}`}>
                <FaChevronRight />
              </div>
            </button>
            <div className={`nav-dropdown-content contact-dropdown ${contactOpen ? 'open' : ''}`}> 
              <div className="contact-links-container">
                <a 
                  href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="contact-link" 
                  title="Instagram"
                >
                  <FaInstagram />
                  <span>Instagram</span>
                </a>
                <a 
                  href="mailto:Solsparrowhq@gmail.com" 
                  className="contact-link" 
                  title="Email"
                >
                  <FaEnvelope />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          
          
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? 'settings-link active' : 'settings-link'} 
            onClick={closeSidebarOnMobile}
          >
            <div className="nav-icon">
              <FaCog />
            </div>
            <span className="nav-text">Settings</span>
            <div className="nav-indicator"></div>
          </NavLink>
        </div>
      </div>
      
      <button className="menu-btn" onClick={handleToggle}>
        <FaBars />
      </button>
    </>
  );
};

export default Sidebar;