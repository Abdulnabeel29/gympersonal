import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaSync, 
  FaCalendarAlt, 
  FaPlus, 
  FaArrowUp, 
  FaArrowDown, 
  FaBalanceScale, 
  FaCalculator,
  FaUsers,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes
} from "react-icons/fa";
import "./ViewFinance.css";
import eventBus from "../../service/eventBus";

const ViewFinance = () => {
  const [entries, setEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editIndex, setEditIndex] = useState(null);
  const [editedEntry, setEditedEntry] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Profit/Loss Calculator State
  const [calculatorInputs, setCalculatorInputs] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    otherIncome: 0,
    otherExpenses: 0
  });

  // Check if entry is from recurring transaction (based on description pattern)
  const isRecurringTransaction = (entry) => {
    return entry.description && entry.description.includes("Auto-generated from recurring transaction");
  };

  // Auto-populate calculator with actual data
  const autoPopulateCalculator = () => {
    const actualRevenue = entries
      .filter((e) => e.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const actualExpenses = entries
      .filter((e) => e.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    setCalculatorInputs({
      totalRevenue: actualRevenue,
      totalExpenses: actualExpenses,
      otherIncome: 0,
      otherExpenses: 0
    });
  };

  // Auto-populate calculator when entries change
  useEffect(() => {
    if (entries.length > 0) {
      autoPopulateCalculator();
    }
  }, [entries]);

  useEffect(() => {
    fetchEntries();
    fetchMembers();

    const handleUpdate = () => fetchEntries();
    eventBus.on('transactions-updated', handleUpdate);

    return () => {
      eventBus.remove('transactions-updated', handleUpdate);
    };
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/finances");
      setEntries(res.data);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/members");
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const deleteEntry = async (index) => {
    const id = entries[index].id;
    try {
      await axios.delete(`https://solsparrow-backend.onrender.com/api/finances/${id}`);
      fetchEntries();
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const updateEntry = async () => {
    try {
      const id = editedEntry.id;
      await axios.put(`https://solsparrow-backend.onrender.com/api/finances/${id}`, editedEntry);
      fetchEntries();
      setEditIndex(null);
    } catch (err) {
      console.error("Failed to update entry:", err);
    }
  };

  const processRecurringTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.post("https://solsparrow-backend.onrender.com/api/recurring/process-due");
      alert(response.data.message);
      fetchEntries(); // Refresh the list to show new entries
      eventBus.dispatch('staff-data-updated'); // Signal staff page to update
    } catch (error) {
      alert("Failed to process recurring transactions");
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial metrics
  const totalIncome = entries
    .filter((e) => e.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncome - totalExpense;

  // Count recurring transactions
  const recurringCount = entries.filter(e => isRecurringTransaction(e)).length;
  const totalRecurringAmount = entries
    .filter(e => isRecurringTransaction(e))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Calculate member dues
  const totalDueAmount = members.reduce((acc, member) => {
    const pending = Number(member.pending_amount) || 0;
    return acc + pending;
  }, 0);

  const totalCollectedAmount = members.reduce((acc, member) => {
    const paid = Number(member.paid_amount) || 0;
    return acc + paid;
  }, 0);

  // Calculate profit/loss from calculator
  const calculatedProfit = (Number(calculatorInputs.totalRevenue) + Number(calculatorInputs.otherIncome)) - 
                          (Number(calculatorInputs.totalExpenses) + Number(calculatorInputs.otherExpenses));

  const filteredEntries =
    filter === "all" ? entries : entries.filter((e) => e.type === filter);

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedEntry({ ...entries[index] });
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditedEntry({});
  };

  const handleCalculatorChange = (field, value) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="view-finance-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Financial Overview</h1>
          <p>Track income, expenses, profit/loss, and member dues in real-time.</p>
        </div>
        <div className="hero-actions">
          <button 
            onClick={processRecurringTransactions}
            disabled={loading}
            className="btn"
          >
            <FaSync /> {loading ? 'Processing...' : 'Process Recurring'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <FaArrowUp />
          </div>
          <div className="stat-content">
            <h3>₹{totalIncome.toLocaleString()}</h3>
            <p>Total Income</p>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon">
            <FaArrowDown />
          </div>
          <div className="stat-content">
            <h3>₹{totalExpense.toLocaleString()}</h3>
            <p>Total Expenses</p>
          </div>
        </div>
        
        <div className="stat-card balance">
          <div className="stat-icon">
            <FaBalanceScale />
          </div>
          <div className="stat-content">
            <h3>₹{balance.toLocaleString()}</h3>
            <p>Current Balance</p>
          </div>
        </div>
        
        <div className="stat-card recurring">
          <div className="stat-icon">
            <FaSync />
          </div>
          <div className="stat-content">
            <h3>{recurringCount}</h3>
            <p>Recurring Transactions</p>
          </div>
        </div>

        <div className="stat-card profit">
          <div className="stat-icon">
            <FaCalculator />
          </div>
          <div className="stat-content">
            <h3>₹{Math.max(0, calculatedProfit).toLocaleString()}</h3>
            <p>Calculated Profit</p>
          </div>
        </div>

        <div className="stat-card loss">
          <div className="stat-icon">
            <FaCalculator />
          </div>
          <div className="stat-content">
            <h3>₹{Math.abs(Math.min(0, calculatedProfit)).toLocaleString()}</h3>
            <p>Calculated Loss</p>
          </div>
        </div>

        <div className="stat-card due">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>₹{totalDueAmount.toLocaleString()}</h3>
            <p>Pending Dues</p>
          </div>
        </div>

        <div className="stat-card collected">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>₹{totalCollectedAmount.toLocaleString()}</h3>
            <p>Collected Amount</p>
          </div>
        </div>
      </div>

      {/* Profit/Loss Calculator Section */}
      <div className="calculator-section">
        <div className="calculator-header">
          <h3>Profit/Loss Calculator</h3>
          <button 
            onClick={autoPopulateCalculator}
            className="btn btn-secondary"
            style={{ 
              background: 'linear-gradient(135deg, #8E44AD, #7D3C98)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaSync /> Auto-Calculate
          </button>
        </div>
        <p style={{ color: '#E3E3E0', opacity: 0.8, marginBottom: '1rem', fontSize: '0.9rem' }}>
          Calculator automatically populated with your actual financial data. You can adjust values manually or click "Auto-Calculate" to refresh.
        </p>
        <div className="calculator-grid">
          <div className="calculator-item">
            <label>Total Revenue</label>
            <input
              type="number"
              value={calculatorInputs.totalRevenue}
              onChange={(e) => handleCalculatorChange('totalRevenue', e.target.value)}
              placeholder="Enter total revenue"
            />
          </div>
          <div className="calculator-item">
            <label>Total Expenses</label>
            <input
              type="number"
              value={calculatorInputs.totalExpenses}
              onChange={(e) => handleCalculatorChange('totalExpenses', e.target.value)}
              placeholder="Enter total expenses"
            />
          </div>
          <div className="calculator-item">
            <label>Other Income</label>
            <input
              type="number"
              value={calculatorInputs.otherIncome}
              onChange={(e) => handleCalculatorChange('otherIncome', e.target.value)}
              placeholder="Enter other income"
            />
          </div>
          <div className="calculator-item">
            <label>Other Expenses</label>
            <input
              type="number"
              value={calculatorInputs.otherExpenses}
              onChange={(e) => handleCalculatorChange('otherExpenses', e.target.value)}
              placeholder="Enter other expenses"
            />
          </div>
        </div>
        <div className="calculator-result">
          <h4>Net Profit/Loss</h4>
          <div className={`result-amount ${calculatedProfit >= 0 ? 'profit' : 'loss'}`}>
            ₹{calculatedProfit.toLocaleString()}
          </div>
          <p>{calculatedProfit >= 0 ? 'Profit' : 'Loss'}</p>
        </div>
      </div>

      {/* Member Dues Section */}
      <div className="dues-section">
        <h3>Member Dues Overview</h3>
        <div className="dues-grid">
          <div className="dues-card">
            <h4>Total Pending Dues</h4>
            <div className="amount">₹{totalDueAmount.toLocaleString()}</div>
            <div className="description">
              Amount pending from {members.filter(m => (Number(m.pending_amount) || 0) > 0).length} members
            </div>
          </div>
          <div className="dues-card">
            <h4>Total Collected</h4>
            <div className="amount">₹{totalCollectedAmount.toLocaleString()}</div>
            <div className="description">
              Successfully collected from {members.filter(m => (Number(m.paid_amount) || 0) > 0).length} members
            </div>
          </div>
          <div className="dues-card">
            <h4>Collection Rate</h4>
            <div className="amount">
              {totalCollectedAmount + totalDueAmount > 0 
                ? Math.round((totalCollectedAmount / (totalCollectedAmount + totalDueAmount)) * 100)
                : 0}%
            </div>
            <div className="description">
              Percentage of dues successfully collected
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            onClick={() => setFilter("all")}
            className={filter === "all" ? "active" : ""}
          >
            All Entries
          </button>
          <button 
            onClick={() => setFilter("income")}
            className={filter === "income" ? "active" : ""}
          >
            Income Only
          </button>
          <button 
            onClick={() => setFilter("expense")}
            className={filter === "expense" ? "active" : ""}
          >
            Expenses Only
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <FaSync style={{ animation: 'spin 1s linear infinite' }} /> Loading...
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <div className="table-container">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Payment</th>
                <th>Description</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`${entry.type === "income" ? "income-row" : "expense-row"} ${
                    isRecurringTransaction(entry) ? "recurring-row" : ""
                  }`}
                >
                  {editIndex === index ? (
                    <>
                      <td>
                        <input
                          type="date"
                          value={editedEntry.date}
                          onChange={(e) =>
                            setEditedEntry({ ...editedEntry, date: e.target.value })
                          }
                        />
                      </td>
                      <td>{editedEntry.type}</td>
                      <td>
                        <input
                          type="number"
                          value={editedEntry.amount}
                          onChange={(e) =>
                            setEditedEntry({
                              ...editedEntry,
                              amount: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedEntry.category}
                          onChange={(e) =>
                            setEditedEntry({
                              ...editedEntry,
                              category: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedEntry.payment}
                          onChange={(e) =>
                            setEditedEntry({
                              ...editedEntry,
                              payment: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editedEntry.description}
                          onChange={(e) =>
                            setEditedEntry({
                              ...editedEntry,
                              description: e.target.value,
                            })
                          }
                        />
                      </td>
                      <td>
                        {isRecurringTransaction(editedEntry) ? (
                          <span style={{ color: '#000000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaSync /> Recurring
                          </span>
                        ) : (
                          <span style={{ color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCalendarAlt /> Manual
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={updateEntry} className="save-btn">
                            <FaSave />
                          </button>
                          <button onClick={handleCancel} className="cancel-btn">
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{entry.date?.slice(0, 10)}</td>
                      <td>{entry.type}</td>
                      <td>₹{entry.amount}</td>
                      <td>{entry.category}</td>
                      <td>{entry.payment}</td>
                      <td>{entry.description}</td>
                      <td>
                        {isRecurringTransaction(entry) ? (
                          <span style={{ color: '#000000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaSync /> Recurring
                          </span>
                        ) : (
                          <span style={{ color: '#000000', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCalendarAlt /> Manual
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleEdit(index)} className="edit-btn">
                            <FaEdit />
                          </button>
                          <button onClick={() => deleteEntry(index)} className="delete-btn">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewFinance;
