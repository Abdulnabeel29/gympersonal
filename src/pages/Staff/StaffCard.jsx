import React from 'react';
import './StaffCard.css';
import { FaUser, FaPhone, FaEnvelope, FaIdCard, FaMoneyBillWave, FaEdit, FaTrash } from 'react-icons/fa';

const StaffCard = ({ staffMember, onSelect, onEdit, onDelete, isWidget }) => {
  const cardClassName = isWidget ? 'staff-card widget-view' : 'staff-card';

  return (
    <div className={cardClassName} onClick={() => !isWidget && onSelect(staffMember)}>
      <div className="staff-card-header">
        <FaUser className="staff-icon" />
        <h3 className="staff-name">{staffMember.name}</h3>
      </div>
      <div className="staff-card-body">
        <div className="staff-info-item">
          <FaIdCard />
          <span>{staffMember.position}</span>
        </div>
        {!isWidget && (
          <>
            <div className="staff-info-item">
              <FaEnvelope />
              <span>{staffMember.email}</span>
            </div>
            <div className="staff-info-item">
              <FaPhone />
              <span>{staffMember.phone}</span>
            </div>
          </>
        )}
        <div className="staff-info-item">
          <FaMoneyBillWave />
          <span>Salary: ₹{staffMember.salary}</span>
        </div>
      </div>
      {!isWidget && (
         <div className="staff-card-footer">
            <button className="edit-button" onClick={(e) => {
                e.stopPropagation();
                onEdit(staffMember);
            }}>
                <FaEdit /> Edit
            </button>
            <button className="delete-button" onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to delete ${staffMember.name}?`)) {
                    onDelete(staffMember.id);
                }
            }}>
                <FaTrash /> Delete
            </button>
         </div>
      )}
    </div>
  );
};

export default StaffCard;
