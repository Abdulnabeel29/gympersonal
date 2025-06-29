import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../pages/Finances/RecurringTransactions.css";

const COLOR = {
  primary: "#28B295",
  background: "#1C1C1E",
  text: "#E3E3E0",
  accent1: "#D6F84C",
  accent2: "#FF715B"
};

const RecurringTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://solsparrow-backend.onrender.com/api/recurring");
      setTransactions(res.data);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const processTransaction = async (id) => {
    setProcessingId(id);
    try {
      const res = await axios.post(`https://solsparrow-backend.onrender.com/api/recurring/process/${id}`);
      alert(res.data.message);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to process transaction");
    } finally {
      setProcessingId(null);
    }
  };

  const processAll = async () => {
    setLoading(true);
    try {
      const res = await axios.post("https://solsparrow-backend.onrender.com/api/recurring/process-due");
      alert(res.data.message);
      fetchTransactions();
    } catch (err) {
      alert("Failed to process all due transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recurring-container" style={{ background: COLOR.background, color: COLOR.text }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: COLOR.accent1 }}>Recurring Transactions</h2>
        <button
          onClick={processAll}
          disabled={loading}
          style={{
            background: COLOR.primary,
            color: COLOR.text,
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 16
          }}
        >
          {loading ? 'Processing...' : 'Process All Due'}
        </button>
      </div>
      <table className="recurring-table" style={{ width: '100%', background: COLOR.background, color: COLOR.text }}>
        <thead>
          <tr style={{ background: COLOR.background, color: COLOR.accent1 }}>
            <th>Name</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Payment</th>
            <th>Frequency</th>
            <th>Next Due</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${COLOR.primary}` }}>
              <td>{t.name}</td>
              <td>{t.type}</td>
              <td>₹{t.amount}</td>
              <td>{t.category}</td>
              <td>{t.payment}</td>
              <td>{t.frequency}</td>
              <td>{t.next_due_date}</td>
              <td style={{ color: t.is_active ? COLOR.primary : COLOR.accent2, fontWeight: 600 }}>
                {t.is_active ? 'Active' : 'Inactive'}
              </td>
              <td>
                <button
                  onClick={() => processTransaction(t.id)}
                  disabled={processingId === t.id || !t.is_active}
                  style={{
                    background: COLOR.accent2,
                    color: COLOR.text,
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                    cursor: t.is_active ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: 14,
                    opacity: processingId === t.id || !t.is_active ? 0.6 : 1
                  }}
                >
                  {processingId === t.id ? 'Processing...' : 'Process'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecurringTransactions; 