import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import StaffCard from '../../../pages/Staff/StaffCard';
import './StaffWidget.css';

const StaffWidget = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // Fetch only a few staff members for the widget view
        const response = await api.get('/staff?limit=4');
        setStaff(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch staff for widget:', error);
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) {
    return <div className="widget-loading">Loading Staff...</div>;
  }

  return (
    <div className="staff-widget-container">
      {staff.length > 0 ? (
        <div className="staff-widget-grid">
          {staff.map((member) => (
            <StaffCard key={member.id} staffMember={member} isWidget={true} />
          ))}
        </div>
      ) : (
        <p className="empty-message">No staff members found.</p>
      )}
    </div>
  );
};

export default StaffWidget; 