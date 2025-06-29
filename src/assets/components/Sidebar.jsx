import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import {
  FaTachometerAlt, FaUsers, FaCalendarAlt, FaBoxOpen, FaDollarSign, 
  FaCog, FaChartLine, FaUserTie, FaQuestionCircle, FaSun, FaMoon, FaBars, FaTimes, FaChevronDown, FaChevronRight,
  FaInstagram, FaEnvelope
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
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="logo">GymSoft</h1>
          <button className="close-btn" onClick={handleToggle}><FaTimes /></button>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={closeSidebarOnMobile}>
              {link.icon} <span>{link.text}</span>
            </NavLink>
          ))}
          
          {/* Finances Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn" onClick={toggleFinances}>
              <FaDollarSign />
              <span>Finances</span>
              {financesOpen ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            <div className={`nav-dropdown-content ${financesOpen ? 'open' : ''}`}>
              <NavLink to="/finances/view" onClick={closeSidebarOnMobile}>
                <span>View Finances</span>
              </NavLink>
              <NavLink to="/finances/add" onClick={closeSidebarOnMobile}>
                <span>Add Finance</span>
              </NavLink>
              <NavLink to="/finances/recurring" onClick={closeSidebarOnMobile}>
                <span>Recurring Transactions</span>
              </NavLink>
            </div>
          </div>

          {/* Contact Us Dropdown */}
          <div className="nav-dropdown">
            <button className="nav-dropdown-btn" onClick={toggleContact}>
              <FaEnvelope />
              <span>Contact Us</span>
              {contactOpen ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            <div className={`nav-dropdown-content ${contactOpen ? 'open' : ''}`}> 
              <a href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4" target="_blank" rel="noopener noreferrer" className="contact-link contact-icon" title="Instagram">
                <FaInstagram />
              </a>
              <a href="mailto:Solsparrowhq@gmail.com" className="contact-link contact-icon" title="Email">
                <FaEnvelope />
              </a>
            </div>
          </div>

          {/* Help Link */}
          <NavLink to="/help" onClick={closeSidebarOnMobile} className="help-link">
            <FaQuestionCircle /> <span>Help & Guide</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-controls">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <NavLink to="/settings" className="settings-link" onClick={closeSidebarOnMobile}>
              <FaCog /> <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>
      <button className="menu-btn" onClick={handleToggle}><FaBars /></button>
    </>
  );
};

export default Sidebar;
