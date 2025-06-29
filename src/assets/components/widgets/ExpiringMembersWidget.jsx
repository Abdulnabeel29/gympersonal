import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import './ExpiringMembersWidget.css';
import { FaUserClock } from 'react-icons/fa';

const ExpiringMembersWidget = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringMembers = async () => {
      try {
        const response = await api.get('/members/expiring-soon');
        setMembers(response.data);
      } catch (error) {
        console.error('Failed to fetch expiring members:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpiringMembers();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const daysUntilExpiry = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    // To ignore time and compare dates only
    const utcExpiry = Date.UTC(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
    const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const days = Math.floor((utcExpiry - utcToday) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    return `Expires in ${days} days`;
  };

  if (loading) {
    return <div className="widget-loading">Loading expiring members...</div>;
  }

  return (
    <div className="expiring-members-widget">
      {members.length > 0 ? (
        <ul className="expiring-list">
          {members.map((member) => (
            <li key={member.id} className="expiring-item">
              <FaUserClock className="expiring-icon" />
              <div className="expiring-details">
                <span className="expiring-name">{member.name}</span>
                <span className="expiring-countdown">{daysUntilExpiry(member.expiry_date)}</span>
              </div>
              <span className="expiring-date">{formatDate(member.expiry_date)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">No members expiring in the next 7 days.</p>
      )}
    </div>
  );
};

export default ExpiringMembersWidget; 