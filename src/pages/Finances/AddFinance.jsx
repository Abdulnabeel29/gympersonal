import React, { useState } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaPen,
  FaRupeeSign,
  FaCreditCard,
  FaTimes,
  FaWifi,
  FaMobileAlt,
  FaPlus,
} from "react-icons/fa";
import "./AddFinance.css";
import { useNavigate } from "react-router-dom";
import eventBus from "../../service/event-bus";

const AddFinance = () => {
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([
    { id: 1, name: "Membership", is_custom: false },
    { id: 2, name: "Maintenance", is_custom: false },
    { id: 3, name: "Equipment", is_custom: false },
    { id: 4, name: "Salaries", is_custom: false },
    { id: 5, name: "Utilities", is_custom: false },
  ]);
  const [customCategory, setCustomCategory] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [recentTransaction, setRecentTransaction] = useState(null);

  const navigate = useNavigate();

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  };

  const getDayBefore = () => {
    const dayBefore = new Date();
    dayBefore.setDate(dayBefore.getDate() - 2);
    return formatDate(dayBefore);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError(true);
      setMessage("Please select or add a category.");
      setTimeout(() => {
        setMessage("");
        setError(false);
      }, 2500);
      return;
    }
    const financeData = {
      type,
      amount,
      date,
      category,
      payment: paymentMethod,
      description,
    };

    try {
      const response = await axios.post(
        "https://solsparrow-backend.onrender.com/api/finances",
        financeData
      );
      setMessage("Transaction added successfully!");
      setError(false);
      setRecentTransaction(response.data);

      if (financeData.type === "expense") {
        eventBus.dispatch("expense-added", { amount: financeData.amount });
      }

      setAmount("");
      setDescription("");
      setTimeout(() => {
        setMessage("");
      }, 2500);
    } catch (err) {
      setError(true);
      setMessage(err.response?.data?.message || "Error adding transaction.");
      setTimeout(() => {
        setMessage("");
        setError(false);
      }, 2500);
    }
  };

  const handleAddCategory = () => {
    if (customCategory.trim() === "") return;
    const newCategory = {
      id: Date.now(),
      name: customCategory.trim(),
      is_custom: true,
    };
    setCategories([...categories, newCategory]);
    setCategory(newCategory.name);
    setCustomCategory("");
  };

  const handleRemoveCategory = (id) => {
    const newCategories = categories.filter((c) => c.id !== id);
    setCategories(newCategories);
    if (category === categories.find((c) => c.id === id)?.name) {
      setCategory(newCategories.length > 0 ? newCategories[0].name : "");
    }
  };

  return (
    <div className="add-finance-page">
      <div className="finance-hero-section">
        <div className="finance-hero-content">
          <h1>Add Transaction</h1>
          <p>Log your income and expenses to keep your finances in order.</p>
        </div>
      </div>
      <div className="finance-form-container">
        <form className="finance-form" onSubmit={handleSubmit}>
          <h2 className="form-title">Finance Details</h2>
          <div className="form-grid">
            <div className="type-selector">
              <button
                type="button"
                className={`type-button ${type === "income" ? "active-income" : ""}`}
                onClick={() => setType("income")}
              >
                <FaMoneyBillWave /> Income
              </button>
              <button
                type="button"
                className={`type-button ${type === "expense" ? "active-expense" : ""}`}
                onClick={() => setType("expense")}
              >
                <FaMoneyCheckAlt /> Expense
              </button>
            </div>

            <div className="input-group">
              <label htmlFor="amount">Amount</label>
              <div className="input-with-icon">
                <span className="icon">
                  <FaRupeeSign />
                </span>
                <input
                  type="number"
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="date">Date</label>
              <div className="input-with-icon">
                <span className="icon">
                  <FaCalendarAlt />
                </span>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="quick-dates">
              <button
                type="button"
                className="quick-date-button"
                onClick={() => setDate(formatDate(new Date()))}
              >
                <FaCalendarAlt /> Today
              </button>
              <button
                type="button"
                className="quick-date-button"
                onClick={() => setDate(getYesterday())}
              >
                <FaCalendarAlt /> Yesterday
              </button>
              <button
                type="button"
                className="quick-date-button"
                onClick={() => setDate(getDayBefore())}
              >
                <FaCalendarAlt /> Day Before
              </button>
            </div>

            <div className="input-group">
              <label>Category</label>
              <div className="category-selector">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-button ${category === cat.name ? "active" : ""}`}
                    onClick={() => setCategory(cat.name)}
                  >
                    {cat.name}
                    {cat.is_custom ? (
                      <span
                        className="remove-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCategory(cat.id);
                        }}
                      >
                        <FaTimes />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-category-section">
              <input
                type="text"
                className="custom-category-input"
                placeholder="Or add a new category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
              <button
                type="button"
                className="add-category-btn"
                onClick={handleAddCategory}
              >
                <FaPlus /> Add
              </button>
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <div className="payment-methods">
                <button
                  type="button"
                  className={`payment-button ${paymentMethod === "Cash" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("Cash")}
                >
                  <FaMoneyBillWave className="icon" /> Cash
                </button>
                <button
                  type="button"
                  className={`payment-button ${paymentMethod === "Card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("Card")}
                >
                  <FaCreditCard className="icon" /> Card
                </button>
                <button
                  type="button"
                  className={`payment-button ${paymentMethod === "Bank Transfer" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("Bank Transfer")}
                >
                  <FaWifi className="icon" /> Bank Transfer
                </button>
                <button
                  type="button"
                  className={`payment-button ${paymentMethod === "UPI" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  <FaMobileAlt className="icon" /> UPI
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="description">Description</label>
              <div className="input-with-icon">
                <span className="icon">
                  <FaPen />
                </span>
                <textarea
                  id="description"
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/finances/view")}
            >
              Cancel
            </button>
            <button type="submit" className="save-button">
              <FaPlus /> Save Entry
            </button>
          </div>

          {message && (
            <div className={`message-box ${error ? "error" : "success"}`}>
              {message}
            </div>
          )}
        </form>

        {recentTransaction && (
          <div className="recent-transaction">
            <h3>Last Entry:</h3>
            <p>
              <strong>Type:</strong> {recentTransaction.type}
            </p>
            <p>
              <strong>Amount:</strong> ₹{recentTransaction.amount}
            </p>
            <p>
              <strong>Category:</strong> {recentTransaction.category}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFinance;