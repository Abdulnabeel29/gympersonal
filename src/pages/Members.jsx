import React, { useState, useEffect } from "react";
import axios from "axios";
import MemberTable from "../assets/components/MemberTable";
import SearchBar from "../assets/components/SearchBar";
import MemberForm from "../assets/components/MemberForm";
import BodyMeasurementsForm from "../assets/components/BodyMeasurementsForm";
import { FaUserPlus, FaEnvelope, FaUsers, FaUserTimes, FaUserClock, FaChartBar, FaFilter } from "react-icons/fa";
import { FiUsers, FiUserCheck, FiUserX, FiAlertTriangle, FiMail, FiPlus } from 'react-icons/fi';
import "./Members.css";
import COLORS from "../data/colors";

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showBodyForm, setShowBodyForm] = useState(false);
  const [bodyMember, setBodyMember] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const today = new Date();

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, activeFilter, packageFilter]);

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/members");
      setMembers(res.data);
      setFilteredMembers(res.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...members];
  
    if (activeFilter === 'expired') {
      filtered = filtered.filter(m => m.expiry_date && new Date(m.expiry_date) < today);
    } else if (activeFilter === 'expiring') {
      filtered = filtered.filter(m => {
        if (!m.expiry_date) return false;
        const exp = new Date(m.expiry_date);
        const diff = (exp - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      });
    }
  
    if (packageFilter !== 'all') {
      filtered = filtered.filter(m => m.package === packageFilter);
    }
  
    setFilteredMembers(filtered);
  };

  const handleSearch = (query) => {
    const lower = query.toLowerCase();
    const result = members.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        (m.member_id && m.member_id.toString().toLowerCase().includes(lower))
    );
    setFilteredMembers(result);
  };

  const handleSave = async (newMember) => {
    try {
      if (editing) {
        await axios.put(`https://solsparrow-backend.onrender.com/api/members/${editing.id}`, newMember);
      } else {
        await axios.post("https://solsparrow-backend.onrender.com/api/members", newMember);
      }
      setShowForm(false);
      setEditing(null);
      fetchMembers();
    } catch (error) {
      console.error("Error saving member:", error);
    }
  };

  const handleDelete = async (ids) => {
    try {
      await Promise.all(ids.map((id) => axios.delete(`https://solsparrow-backend.onrender.com/api/members/${id}`)));
      fetchMembers();
    } catch (error) {
      console.error("Error deleting members:", error);
    }
  };

  const handleSMS = async () => {
    setSmsLoading(true);
    setSmsMessage("");
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/members/send-expiry-reminders");
      setSmsMessage(res.data.message || "SMS sent successfully!");
    } catch (error) {
      setSmsMessage("Failed to send SMS reminders.");
      console.error("Failed to send SMS:", error);
    } finally {
      setSmsLoading(false);
    }
  };

  const handleOpenBodyMeasurements = (member) => {
    setBodyMember(member);
    setShowBodyForm(true);
  };

  const packageTypes = [...new Set(members.map(m => m.package))];
  
  // Calculate statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => {
    if (!m.expiry_date) return false;
    return new Date(m.expiry_date) >= today;
  }).length;
  const expiredMembers = members.filter(m => m.expiry_date && new Date(m.expiry_date) < today).length;
  const expiringMembers = members.filter(m => {
    if (!m.expiry_date) return false;
    const exp = new Date(m.expiry_date);
    const diff = (exp - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div className="members-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Member Management</h1>
          <p>An overview of your gym's membership status.</p>
        </div>
        <div className="action-buttons">
          <button className="btn" onClick={() => console.log('Send Reminders clicked!')}>
            <FiMail />
            <span>Send Reminders</span>
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <FiPlus />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{totalMembers}</h3>
            <p>Total Members</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FiUserCheck />
          </div>
          <div className="stat-content">
            <h3>{activeMembers}</h3>
            <p>Active Members</p>
          </div>
        </div>
        <div className="stat-card expiring">
          <div className="stat-icon">
            <FiAlertTriangle />
          </div>
          <div className="stat-content">
            <h3>{expiringMembers}</h3>
            <p>Expiring Soon</p>
          </div>
        </div>
        <div className="stat-card expired">
          <div className="stat-icon">
            <FiUserX />
          </div>
          <div className="stat-content">
            <h3>{expiredMembers}</h3>
            <p>Expired Members</p>
          </div>
        </div>
      </div>

      {/* SMS Message */}
      {smsMessage && (
        <div className={`sms-message ${smsMessage.includes('Failed') ? 'error' : 'success'}`}>
          {smsMessage}
        </div>
      )}

      {/* Search and Controls Section */}
      <div className="controls-section">
        <div className="search-section">
          <SearchBar onSearch={handleSearch} />
          <button 
            className="btn filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            <span>Filters</span>
          </button>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status Filter:</label>
              <div className="filter-buttons">
                <button 
                  onClick={() => setActiveFilter('all')} 
                  className={activeFilter === 'all' ? 'active' : ''}
                >
                  <FaUsers /> All
                </button>
                <button 
                  onClick={() => setActiveFilter('expired')} 
                  className={activeFilter === 'expired' ? 'active' : ''}
                >
                  <FaUserTimes /> Expired
                </button>
                <button 
                  onClick={() => setActiveFilter('expiring')} 
                  className={activeFilter === 'expiring' ? 'active' : ''}
                >
                  <FaUserClock /> Expiring Soon
                </button>
              </div>
            </div>
            
            <div className="filter-group">
              <label>Package Filter:</label>
              <select 
                onChange={(e) => setPackageFilter(e.target.value)} 
                className="package-filter"
                value={packageFilter}
              >
                <option value="all">All Packages</option>
                {packageTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-info">
          <FaChartBar />
          <span>Showing {filteredMembers.length} of {totalMembers} members</span>
        </div>
        {activeFilter !== 'all' && (
          <div className="active-filter">
            Filter: {activeFilter === 'expired' ? 'Expired Members' : 'Expiring Soon'}
          </div>
        )}
      </div>

      {/* Members Table */}
      <div className="table-section">
        <MemberTable
          members={filteredMembers}
          onEdit={(member) => {
            setEditing(member);
            setShowForm(true);
          }}
          onDelete={handleDelete}
          onOpenBodyMeasurements={handleOpenBodyMeasurements}
        />
      </div>

      {/* Modals */}
      {showForm && (
        <MemberForm
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          member={editing}
        />
      )}
      {showBodyForm && (
        <BodyMeasurementsForm
          member={bodyMember}
          onClose={() => setShowBodyForm(false)}
          onSave={fetchMembers}
        />
      )}
    </div>
  );
};

export default Members;
