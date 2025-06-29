import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import './AlertsWidget.css';
import { FaUserClock, FaExclamationTriangle, FaBoxOpen, FaMoneyBillWave, FaBell } from 'react-icons/fa';

const AlertsWidget = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/insights/alerts');
        setAlerts(response.data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'FaUserClock': return <FaUserClock />;
      case 'FaExclamationTriangle': return <FaExclamationTriangle />;
      case 'FaBoxOpen': return <FaBoxOpen />;
      case 'FaMoneyBillWave': return <FaMoneyBillWave />;
      default: return <FaBell />;
    }
  };

  if (loading) {
    return <div className="widget-loading">Loading alerts...</div>;
  }

  return (
    <div className="alerts-widget-container">
      {alerts.length > 0 ? (
        <ul className="alerts-list">
          {alerts.map((alert, index) => (
            <li key={index} className={`alert-item ${alert.type}`}>
              <div className="alert-icon">
                {getIcon(alert.icon)}
              </div>
              <div className="alert-message">
                {alert.message}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-alerts">
          <FaBell className="no-alerts-icon" />
          <p>No alerts at the moment</p>
          <span>Everything looks good!</span>
        </div>
      )}
    </div>
  );
};

export default AlertsWidget; 