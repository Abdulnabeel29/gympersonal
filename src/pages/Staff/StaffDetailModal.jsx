import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaTimes, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const StaffDetailModal = ({ staff, onClose, onMarkSalaryPaid }) => {
  const salaryStatusPaid = staff.salary_status === 'Paid';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><FaTimes /></button>
        <img src={staff.photo || 'https://placehold.co/150'} alt={staff.name} className="modal-img" />
        <h2 id="modal-title">{staff.name}</h2>
        <p className="modal-role">{staff.role}</p>
        
        <div className="modal-info">
          <p><FaPhone /> {staff.phone}</p>
          {staff.email && <p><FaEnvelope /> {staff.email}</p>}
          {staff.address && <p><FaMapMarkerAlt /> {staff.address}</p>}
        </div>

        <div className="modal-finance-details">
          <h4>Financials</h4>
          <p><FaMoneyBillWave /> Salary: <strong>₹{(staff.salary || 0).toLocaleString()}</strong></p>
          <div className={`salary-status ${salaryStatusPaid ? 'paid' : 'pending'}`}>
            {salaryStatusPaid ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span>Salary Status: <strong>{staff.salary_status}</strong></span>
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className={`btn ${salaryStatusPaid ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => onMarkSalaryPaid(staff.id, salaryStatusPaid ? 'Pending' : 'Paid')}
            disabled={salaryStatusPaid}
          >
            {salaryStatusPaid ? 'Paid' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;

