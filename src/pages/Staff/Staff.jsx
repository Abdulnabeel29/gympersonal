import React, { useState, useEffect } from "react";
import AddStaffForm from "./AddStaffForm";
import StaffCard from "./StaffCard";
import StaffDetailModal from "./StaffDetailModal";
import "./Staff.css";
import { FaPlus, FaUsers, FaUserCheck, FaDumbbell, FaPhone } from 'react-icons/fa';
import api from "../../service/api";
import eventBus from "../../service/eventBus";

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchStaff();

    const handleUpdate = () => fetchStaff();
    eventBus.on('staff-data-updated', handleUpdate);

    return () => {
      eventBus.remove('staff-data-updated', handleUpdate);
    };
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get("/staff");
      setStaffList(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddOrUpdate = async (staffData) => {
    try {
      console.log('Saving staff data:', staffData);
      console.log('Is editing:', isEditing);
      console.log('Selected staff:', selectedStaff);
      
      if (isEditing && selectedStaff) {
        console.log('Updating staff with ID:', selectedStaff.id);
        await api.put(`/staff/${selectedStaff.id}`, staffData);
      } else {
        console.log('Adding new staff member');
        await api.post('/staff', staffData);
      }
      console.log('Staff saved successfully');
      fetchStaff();
      handleCancel();
    } catch (error) {
      console.error('Error saving staff member:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleMarkSalaryPaid = async (id, status) => {
    try {
      const res = await api.put(`/staff/${id}/salary-status`, { salary_status: status });
      const updatedStaff = res.data;
      setStaffList(staffList.map(s => s.id === id ? updatedStaff : s));
      setSelectedStaff(updatedStaff);
    } catch (error) {
      console.error('Error updating salary status:', error);
    }
  };

  const deleteStaff = async (id) => {
    try {
      await api.delete(`/staff/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsEditing(true);
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setSelectedStaff(null);
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleAddNew = () => {
    setSelectedStaff(null);
    setIsEditing(false);
    setShowAddForm(true);
  };

  // Calculate stats
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(staff => staff.status === 'Active').length;
  const trainers = staffList.filter(staff => staff.role === 'Trainer').length;
  const receptionists = staffList.filter(staff => staff.role === 'Receptionist').length;

  return (
    <div className="staff-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Staff Management</h1>
          <p>Oversee all staff members, roles, and schedules.</p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <FaPlus /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{totalStaff}</h3>
            <p>Total Staff</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <FaUserCheck />
          </div>
          <div className="stat-content">
            <h3>{activeStaff}</h3>
            <p>Active Staff</p>
          </div>
        </div>
        <div className="stat-card trainers">
          <div className="stat-icon">
            <FaDumbbell />
          </div>
          <div className="stat-content">
            <h3>{trainers}</h3>
            <p>Trainers</p>
          </div>
        </div>
        <div className="stat-card receptionists">
          <div className="stat-icon">
            <FaPhone />
          </div>
          <div className="stat-content">
            <h3>{receptionists}</h3>
            <p>Receptionists</p>
          </div>
        </div>
      </div>

      {/* Add Staff Form */}
      {(showAddForm || isEditing) && (
        <AddStaffForm 
          onSave={handleAddOrUpdate}
          onCancel={handleCancel}
          staff={selectedStaff}
        />
      )}

      {/* Staff Grid */}
      <div className="staff-grid">
        {staffList.map((staff) => (
          <StaffCard
            key={staff.id}
            staffMember={staff}
            onSelect={() => setSelectedStaff(staff)}
            onEdit={handleEdit}
            onDelete={deleteStaff}
          />
        ))}
      </div>

      {selectedStaff && !isEditing && !showAddForm && (
        <StaffDetailModal 
          staff={selectedStaff} 
          onClose={handleCancel}
          onEdit={() => handleEdit(selectedStaff)}
          onMarkSalaryPaid={handleMarkSalaryPaid}
        />
      )}
    </div>
  );
};

export default Staff;
