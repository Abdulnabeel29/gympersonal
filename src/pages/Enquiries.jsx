import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Enquiries.css';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const Enquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [filteredEnquiries, setFilteredEnquiries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'Walk-in',
        interest: 'Membership',
        status: 'New',
        follow_up_date: '',
        notes: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchEnquiries();
    }, []);

    useEffect(() => {
        let result = enquiries.filter(e => 
            e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.phone.includes(searchTerm)
        );
        setFilteredEnquiries(result);
    }, [searchTerm, enquiries]);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            const res = await axios.get('https://solsparrow-backend.onrender.com/api/enquiries');
            setEnquiries(res.data);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to fetch enquiries.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Input change:', name, value); // Debug log
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            console.log('Updated form data:', newData); // Debug log
            return newData;
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Submitting form data:', formData);
        console.log('Form validation - name:', formData.name, 'phone:', formData.phone);
        
        // Validate required fields
        if (!formData.name || !formData.phone) {
            setMessage({ type: 'error', text: 'Name and phone number are required.' });
            setLoading(false);
            return;
        }
        
        const url = editingEnquiry
            ? `https://solsparrow-backend.onrender.com/api/enquiries/${editingEnquiry.id}`
            : 'https://solsparrow-backend.onrender.com/api/enquiries';
        const method = editingEnquiry ? 'put' : 'post';

        try {
            console.log('Making request to:', url, 'with method:', method);
            const response = await axios[method](url, formData);
            console.log('Response:', response.data);
            setMessage({ type: 'success', text: `Enquiry successfully ${editingEnquiry ? 'updated' : 'added'}.` });
            fetchEnquiries();
            closeModal();
        } catch (err) {
            console.error('Error submitting form:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save enquiry.' });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (enquiry = null) => {
        console.log('Opening modal with enquiry:', enquiry); // Debug log
        if (enquiry) {
            setEditingEnquiry(enquiry);
            const editData = {
                name: enquiry.name,
                phone: enquiry.phone,
                email: enquiry.email || '',
                source: enquiry.source || 'Walk-in',
                interest: enquiry.interest || 'Membership',
                status: enquiry.status || 'New',
                follow_up_date: enquiry.follow_up_date ? enquiry.follow_up_date.slice(0, 10) : '',
                notes: enquiry.notes || ''
            };
            console.log('Setting edit data:', editData); // Debug log
            setFormData(editData);
        } else {
            setEditingEnquiry(null);
            const newData = {
                name: '', phone: '', email: '', source: 'Walk-in', interest: 'Membership',
                status: 'New', follow_up_date: '', notes: ''
            };
            console.log('Setting new data:', newData); // Debug log
            setFormData(newData);
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEnquiry(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this enquiry?')) {
            try {
                await axios.delete(`https://solsparrow-backend.onrender.com/api/enquiries/${id}`);
                setMessage({ type: 'success', text: 'Enquiry deleted.' });
                fetchEnquiries();
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to delete enquiry.' });
            }
        }
    };
    
    // Dismiss message after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div className="enquiries-page">
            <div className="hero-section">
                <h1>Enquiry CRM</h1>
                <p>Manage all potential leads and track their journey from enquiry to membership.</p>
            </div>

            {message && (
                <div className={`message-banner ${message.type === 'success' ? 'success' : 'error'}`}>
                    {message.text}
                </div>
            )}

            <div className="enquiries-controls">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="enquiries-btn-primary" onClick={() => openModal()}>
                    <FaPlus /> Add Enquiry
                </button>
            </div>

            <div className="table-container">
                <table className="enquiries-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Interest</th>
                            <th>Status</th>
                            <th>Follow-up Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="loading-row">Loading enquiries...</td></tr>
                        ) : filteredEnquiries.length > 0 ? (
                            filteredEnquiries.map(enq => (
                                <tr key={enq.id}>
                                    <td>{enq.name}</td>
                                    <td>
                                        <div>{enq.phone}</div>
                                        <div className="email-text">{enq.email}</div>
                                    </td>
                                    <td>{enq.interest}</td>
                                    <td><span className={`status-badge status-${enq.status.toLowerCase()}`}>{enq.status}</span></td>
                                    <td>{enq.follow_up_date ? new Date(enq.follow_up_date).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <div className="enquiries-action-buttons">
                                            <button className="enquiries-edit-btn" onClick={() => openModal(enq)}><FaEdit /></button>
                                            <button className="enquiries-delete-btn" onClick={() => handleDelete(enq.id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="no-results-row">No enquiries found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingEnquiry ? 'Edit Enquiry' : 'Add New Enquiry'}</h2>
                            <button className="close-btn" onClick={closeModal}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="enquiries-form-grid">
                                <div className="enquiries-form-group">
                                    <label>Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                                </div>
                                <div className="enquiries-form-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                                </div>
                                <div className="enquiries-form-group">
                                    <label>Email (Optional)</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                                </div>
                                <div className="enquiries-form-group">
                                    <label>Source</label>
                                    <select name="source" value={formData.source} onChange={handleInputChange}>
                                        <option>Walk-in</option>
                                        <option>Phone Call</option>
                                        <option>Website</option>
                                        <option>Referral</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="enquiries-form-group">
                                    <label>Interest</label>
                                    <select name="interest" value={formData.interest} onChange={handleInputChange}>
                                        <option>Membership</option>
                                        <option>Personal Training</option>
                                        <option>Zumba</option>
                                        <option>Yoga</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div className="enquiries-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option>New</option>
                                        <option>Follow-up</option>
                                        <option>Converted</option>
                                        <option>Lost</option>
                                    </select>
                                </div>
                            </div>
                            <div className="enquiries-form-group">
                                <label>Follow-up Date (Optional)</label>
                                <input type="date" name="follow_up_date" value={formData.follow_up_date} onChange={handleInputChange} />
                            </div>
                            <div className="enquiries-form-group">
                                <label>Notes (Optional)</label>
                                <textarea name="notes" value={formData.notes} onChange={handleInputChange}></textarea>
                            </div>
                            <div className="enquiries-form-actions">
                                <button type="submit" className="enquiries-btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Enquiry'}</button>
                                <button type="button" className="enquiries-btn-secondary" onClick={closeModal}>Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Enquiries; 