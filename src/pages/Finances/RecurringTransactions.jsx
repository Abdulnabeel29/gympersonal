import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaUserTie,
  FaSync,
  FaPlay,
  FaPause
} from "react-icons/fa";
import "./RecurringTransactions.css";

const RecurringTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "expense",
    amount: "",
    category: "Salaries",
    payment: "Bank Transfer",
    description: "",
    frequency: "monthly",
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
    staff_id: ""
  });

  const categories = [
    "Salaries", "Rent", "Utilities", "Insurance", "Maintenance", 
    "Equipment", "Marketing", "Membership", "Other"
  ];

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ];

  const paymentMethods = [
    "Cash", "Bank Transfer", "Card", "UPI", "Check"
  ];

  useEffect(() => {
    fetchTransactions();
    fetchStaff();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://solsparrow-backend.onrender.com/api/recurring");
      setTransactions(response.data);
    } catch (error) {
      setMessage("Failed to fetch recurring transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get("https://solsparrow-backend.onrender.com/api/staff");
      setStaff(response.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");

      if (editingId) {
        await axios.put(`https://solsparrow-backend.onrender.com/api/recurring/${editingId}`, form);
        setMessage("Recurring transaction updated successfully!");
      } else {
        await axios.post("https://solsparrow-backend.onrender.com/api/recurring", form);
        setMessage("Recurring transaction created successfully!");
      }

      fetchTransactions();
      resetForm();
    } catch (error) {
      setMessage("Failed to save recurring transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setForm({
      name: transaction.name,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      payment: transaction.payment,
      description: transaction.description || "",
      frequency: transaction.frequency,
      start_date: transaction.start_date,
      end_date: transaction.end_date || "",
      staff_id: transaction.staff_id || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recurring transaction?")) {
      return;
    }

    try {
      await axios.delete(`https://solsparrow-backend.onrender.com/api/recurring/${id}`);
      setMessage("Recurring transaction deleted successfully!");
      fetchTransactions();
    } catch (error) {
      setMessage("Failed to delete recurring transaction");
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      const transaction = transactions.find(t => t.id === id);
      await axios.put(`https://solsparrow-backend.onrender.com/api/recurring/${id}`, {
        ...transaction,
        is_active: !isActive
      });
      fetchTransactions();
    } catch (error) {
      setMessage("Failed to update transaction status");
    }
  };

  const handleProcessOne = async (id) => {
    setProcessingId(id);
    try {
      const res = await axios.post(`https://solsparrow-backend.onrender.com/api/recurring/process/${id}`);
      setMessage(res.data.message);
      fetchTransactions();
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to process transaction");
    } finally {
      setProcessingId(null);
    }
  };

  const handleProcessNow = async () => {
    try {
      setLoading(true);
      const response = await axios.post("https://solsparrow-backend.onrender.com/api/recurring/process-due");
      setMessage(response.data.message);
      fetchTransactions();
    } catch (error) {
      setMessage("Failed to process transactions");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      type: "expense",
      amount: "",
      category: "Salaries",
      payment: "Bank Transfer",
      description: "",
      frequency: "monthly",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
      staff_id: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (isActive, nextDueDate) => {
    if (!isActive) return "inactive";
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 3) return "urgent";
    if (daysUntilDue <= 7) return "warning";
    return "active";
  };

  return (
    <div className="recurring-transactions">
      <div className="header">
        <h2>Recurring Transactions</h2>
        <div className="header-actions">
          <button 
            className="process-btn"
            onClick={handleProcessNow}
            disabled={loading}
          >
            <FaSync /> Process Due
          </button>
          <button 
            className="add-btn"
            onClick={() => setShowForm(true)}
          >
            <FaPlus /> Add Recurring
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="recurring-form-container">
            <h3>{editingId ? "Edit" : "Add"} Recurring Transaction</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h4 className="form-section-title">Transaction Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="e.g., Monthly Rent"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Type *</label>
                    <div className="type-buttons full-width">
                      <button
                        type="button"
                        className={`type-btn income ${form.type === 'income' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, type: 'income' })}
                      >
                        <FaMoneyBillWave /> Income
                      </button>
                      <button
                        type="button"
                        className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, type: 'expense' })}
                      >
                        <FaMoneyCheckAlt /> Expense
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Amount *</label>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Schedule & Payment</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Payment Method *</label>
                    <select
                      name="payment"
                      value={form.payment}
                      onChange={(e) => setForm({ ...form, payment: e.target.value })}
                      required
                    >
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Frequency *</label>
                    <select
                      name="frequency"
                      value={form.frequency}
                      onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      required
                    >
                      {frequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date (Optional)</label>
                    <input
                      type="date"
                      value={form.end_date}
                      onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      placeholder="dd-mm-yyyy"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Additional Information</h4>
                <div className="form-grid">
                  {form.category === "Salaries" && (
                    <div className="form-group full-width">
                      <label>Staff Member (Optional)</label>
                      <select
                        name="staff_id"
                        value={form.staff_id}
                        onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                      >
                        <option value="">Select Staff Member</option>
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>{s.name} - {s.role}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Optional description..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="transactions-list">
        {loading && <div className="loading">Loading...</div>}
        
        {transactions.length === 0 && !loading && (
          <div className="empty-state">
            <FaCalendarAlt />
            <p>No recurring transactions yet</p>
            <button onClick={() => setShowForm(true)} className="add-btn">
              <FaPlus /> Add Your First Recurring Transaction
            </button>
          </div>
        )}

        {transactions.map(transaction => (
          <div key={transaction.id} className={`transaction-card ${getStatusColor(transaction.is_active, transaction.next_due_date)}`}>
            <div className="transaction-header">
              <h4>{transaction.name}</h4>
              <div className="transaction-actions">
                <button
                  onClick={() => handleToggleActive(transaction.id, transaction.is_active)}
                  className={`toggle-btn ${transaction.is_active ? 'active' : 'inactive'}`}
                  title={transaction.is_active ? 'Pause' : 'Activate'}
                >
                  {transaction.is_active ? <FaPause /> : <FaPlay />}
                </button>
                <button
                  onClick={() => handleEdit(transaction)}
                  className="edit-btn"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="delete-btn"
                  title="Delete"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleProcessOne(transaction.id)}
                  className="process-one-btn"
                  disabled={processingId === transaction.id || !transaction.is_active}
                  title="Process Now"
                >
                  {processingId === transaction.id ? <FaSync className="spinning" /> : <FaPlay />}
                </button>
              </div>
            </div>

            <div className="transaction-details">
              <div className="detail-row">
                <span className="amount">
                  ₹{transaction.amount}
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </span>
                <span className="frequency">{transaction.frequency}</span>
              </div>

              <div className="detail-row">
                <span className="category">{transaction.category}</span>
                <span className="payment">{transaction.payment}</span>
              </div>

              {transaction.staff_name && (
                <div className="detail-row">
                  <span className="staff">
                    <FaUserTie /> {transaction.staff_name}
                  </span>
                </div>
              )}

              <div className="detail-row">
                <span className="next-due">
                  <FaCalendarAlt /> Next: {new Date(transaction.next_due_date).toLocaleDateString()}
                </span>
                <span className={`status ${getStatusColor(transaction.is_active, transaction.next_due_date)}`}>
                  {transaction.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {transaction.description && (
                <div className="description">{transaction.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringTransactions;