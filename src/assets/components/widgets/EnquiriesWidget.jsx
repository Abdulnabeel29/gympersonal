import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import './EnquiriesWidget.css';

const EnquiriesWidget = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        console.log('EnquiriesWidget: Fetching enquiries...'); // Debug log
        const response = await api.get('/enquiries?status=new&limit=5');
        console.log('EnquiriesWidget: Response:', response.data); // Debug log
        setEnquiries(response.data);
        setLoading(false);
      } catch (error) {
        console.error('EnquiriesWidget: Failed to fetch enquiries:', error);
        // Fallback mock data when backend is not available
        const mockEnquiries = [
          { id: 1, name: 'John Doe', notes: 'Interested in membership', enquiry_date: '2025-06-21' },
          { id: 2, name: 'Jane Smith', notes: 'Asking about personal training', enquiry_date: '2025-06-20' },
          { id: 3, name: 'Bob Johnson', notes: 'Walk-in enquiry', enquiry_date: '2025-06-19' }
        ];
        setEnquiries(mockEnquiries);
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (loading) {
    return <div className="widget-loading">Loading Enquiries...</div>;
  }

  return (
    <div className="enquiries-widget-container">
      {enquiries.length > 0 ? (
        <ul className="enquiry-list">
          {enquiries.map((e) => (
            <li key={e.id} className="enquiry-item">
              <div className="enquiry-details">
                <span className="enquiry-name">{e.name}</span>
                <span className="enquiry-notes">{e.notes}</span>
              </div>
              <div className="enquiry-right">
                <span className="enquiry-date">{formatDate(e.enquiry_date)}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">No new enquiries.</p>
      )}
    </div>
  );
};

export default EnquiriesWidget; 