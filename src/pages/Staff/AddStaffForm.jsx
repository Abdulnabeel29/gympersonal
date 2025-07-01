import React, { useState, useEffect } from "react";
import "./Staff.css";
import { FaUser, FaBriefcase, FaPhone, FaEnvelope, FaMapMarkerAlt, FaMoneyBillWave, FaImage } from 'react-icons/fa';

const AddStaffForm = ({ onSave, onCancel, staff }) => {
  const [formData, setFormData] = useState(
    staff || {
      name: "",
      role: "Trainer",
      phone: "",
      email: "",
      address: "",
      photo: "",
      status: "Active",
      salary: "",
      employment_type: "Full-time", // New field
    }
  );

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || "",
        role: staff.role || "Trainer",
        phone: staff.phone || "",
        email: staff.email || "",
        address: staff.address || "",
        photo: staff.photo || "",
        status: staff.status || "Active",
        salary: staff.salary || "",
        employment_type: staff.employment_type || "Full-time",
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;
    // Restrict phone to 10 digits only (numbers only)
    if (name === "phone") {
      val = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Check if required fields are filled
    if (!formData.name || !formData.phone || !formData.role) {
      alert('Please fill in all required fields (Name, Phone, Role)');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="staff-add-form-container">
      <form onSubmit={handleSubmit} className="staff-add-form">
        <h2>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
        <div className="staff-form-grid">
          <div className="staff-form-group">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required />
          </div>
          <div className="staff-form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="Trainer">Trainer</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Manager">Manager</option>
              <option value="Cleaner">Cleaner</option>
            </select>
          </div>
          <div className="staff-form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              required
              pattern="^\d{10}$"
              title="Enter a valid 10-digit number"
              maxLength={10}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <div className="staff-form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter email address" />
          </div>
          <div className="staff-form-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter address" />
          </div>
          <div className="staff-form-group">
            <label htmlFor="photo">Photo URL</label>
            <input id="photo" name="photo" value={formData.photo} onChange={handleChange} placeholder="Enter photo URL" />
          </div>
          <div className="staff-form-group">
            <label htmlFor="salary">Salary</label>
            <input id="salary" name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="Enter monthly salary" />
          </div>
          <div className="staff-form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div className="staff-form-group">
            <label htmlFor="employment_type">Employment Type</label>
            <select
              id="employment_type"
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
        <div className="staff-form-actions">
          <button type="submit" className="btn btn-primary">
            {staff ? 'Save Changes' : 'Add Staff'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;