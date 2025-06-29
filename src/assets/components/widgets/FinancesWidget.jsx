import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './FinancesWidget.css';

const FinancesWidget = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      setLoading(true);
      try {
        // Fetch only the 5 most recent transactions for the widget view
        console.log('Fetching finances for widget...'); // Debug log
        const response = await api.get('/finances?limit=5&page=1');
        console.log('Finances response:', response.data); // Debug log
        setTransactions(response.data.finances || []);
      } catch (error) {
        console.error('Failed to fetch finances for widget:', error);
        setTransactions([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchFinances();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <div className="widget-loading">Loading Finances...</div>;
  }

  return (
    <div className="finance-widget-container">
      {transactions.length > 0 ? (
        <ul className="transaction-list">
          {transactions.map((t) => (
            <li key={t.id} className="transaction-item">
              <div className={`transaction-icon ${t.type}`}>
                {t.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
              </div>
              <div className="transaction-details">
                <span className="transaction-description">{t.description}</span>
                <span className="transaction-category">{t.category}</span>
              </div>
              <div className="transaction-right">
                <span className={`transaction-amount ${t.type}`}>
                  {t.type === 'expense' ? '-' : '+'}₹{parseFloat(t.amount).toLocaleString()}
                </span>
                <span className="transaction-date">{formatDate(t.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">No recent transactions.</p>
      )}
    </div>
  );
};

export default FinancesWidget; 