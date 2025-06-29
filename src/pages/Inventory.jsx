import React, { useState, useEffect } from "react";
import "./Inventory.css";
import { FaPlus, FaDollarSign, FaStar, FaExclamationTriangle, FaChartLine, FaBoxes, FaDolly } from "react-icons/fa";

const Inventory = () => {
    const [items, setItems] = useState([]);
    const [analytics, setAnalytics] = useState({
        bestSellers: [],
        lowStockItems: [],
        salesStats: { total_sales: 0, total_items_sold: 0, total_profit: 0, avg_profit_per_sale: 0 }
    });
    const [message, setMessage] = useState("");
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [lowStockThreshold, setLowStockThreshold] = useState(5);
    const [operationalCosts, setOperationalCosts] = useState({ costs: [], totalOperationalCost: 0 });
    const [newOperationalCost, setNewOperationalCost] = useState({
        description: "",
        amount: "",
        category: "Operational Cost"
    });
    const [newItem, setNewItem] = useState({
        name: "",
        cost_price: "",
        selling_price: "",
        stock: "",
        category: "",
        dealer_contact: "",
    });

    // Fetch inventory and analytics
    useEffect(() => {
        fetchInventory();
        fetchAnalytics();
        fetchLowStockThreshold();
        fetchOperationalCosts();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/inventory");
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error("Failed to fetch inventory:", err);
            setMessage("❌ Error fetching inventory");
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/inventory/analytics");
            const data = await res.json();
            setAnalytics(data);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
        }
    };

    const fetchLowStockThreshold = async () => {
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/settings/low-stock-threshold");
            const data = await res.json();
            setLowStockThreshold(data.threshold);
        } catch (err) {
            console.error("Failed to fetch low stock threshold:", err);
        }
    };

    const fetchOperationalCosts = async () => {
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/inventory/operational-costs");
            const data = await res.json();
            setOperationalCosts(data);
        } catch (err) {
            console.error("Failed to fetch operational costs:", err);
        }
    };

    const updateLowStockThreshold = async () => {
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/settings/low-stock-threshold", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threshold: lowStockThreshold })
            });
            
            if (res.ok) {
                fetchAnalytics(); // Refresh analytics with new threshold
                setMessage("✅ Low stock threshold updated successfully!");
            } else {
                setMessage("❌ Failed to update threshold");
            }
        } catch (err) {
            console.error("Failed to update threshold:", err);
            setMessage("❌ Error updating threshold");
        }
        
        setTimeout(() => setMessage(""), 3000);
    };

    const addOperationalCost = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/inventory/operational-cost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newOperationalCost)
            });
            
            if (res.ok) {
                fetchOperationalCosts();
                setNewOperationalCost({ description: "", amount: "", category: "Operational Cost" });
                setMessage("✅ Operational cost logged successfully!");
            } else {
                setMessage("❌ Failed to log operational cost");
            }
        } catch (err) {
            console.error("Failed to log operational cost:", err);
            setMessage("❌ Error logging operational cost");
        }
        
        setTimeout(() => setMessage(""), 3000);
    };

    // Sell item
    const handleSell = async (id) => {
        try {
            const res = await fetch(`https://solsparrow-backend.onrender.com/api/inventory/sell/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment: "Cash" })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Sell failed.");

            // Refresh both inventory and analytics
            fetchInventory();
            fetchAnalytics();
            setMessage(`✅ ${data.message} (Profit: ₹${data.profit})`);
        } catch (error) {
            console.error(error);
            setMessage(`❌ ${error.message}`);
        } finally {
            setTimeout(() => setMessage(""), 3000);
        }
    };

    // Delete locally (not connected to backend)
    const handleDelete = (id) => {
        setItems(items.filter(item => item.id !== id));
        setMessage("❌ Item deleted.");
        setTimeout(() => setMessage(""), 2000);
    };

    // Edit modal handlers
    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditForm({ ...item });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setItems(items.map(item => item.id === editForm.id ? editForm : item));
        setMessage(`✏️ Updated "${editForm.name}"`);
        setEditingItem(null);
        setTimeout(() => setMessage(""), 2000);
    };

    // Add item
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const id = Date.now();
        const itemToAdd = {
            ...newItem,
            id,
            cost_price: +newItem.cost_price,
            selling_price: +newItem.selling_price,
            stock: +newItem.stock,
        };

        try {
            const res = await fetch("https://solsparrow-backend.onrender.com/api/inventory/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: itemToAdd.name,
                    cost_price: itemToAdd.cost_price,
                    selling_price: itemToAdd.selling_price,
                    stock: itemToAdd.stock,
                    category: itemToAdd.category,
                    dealer_contact: itemToAdd.dealer_contact,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Add failed");

            setItems([...items, itemToAdd]);
            setMessage(`🆕 ${data.message || `Added "${itemToAdd.name}"`}`);
        } catch (error) {
            console.error(error);
            setMessage(`❌ ${error.message}`);
        } finally {
            setShowAddModal(false);
            setNewItem({ name: "", cost_price: "", selling_price: "", stock: "", category: "", dealer_contact: "" });
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const totalValue = items.reduce((total, item) => total + (item.selling_price * item.stock), 0);
    const lowStockItems = analytics.lowStockItems.length;
    const bestSeller = analytics.bestSellers.length > 0 ? analytics.bestSellers[0].product_name : 'N/A';

    return (
        <div className="inventory-wrapper">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Store Inventory</h1>
                    <p>Manage your gym's retail products, track sales, monitor stock levels, and analyze profitability.</p>
                </div>
                <div className="hero-actions">
                    <button 
                        className="btn btn-secondary" 
                        onClick={() => setShowSettings(!showSettings)}
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
                        ⚙️ Settings
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <FaPlus /> Add New Item
                    </button>
                </div>
            </div>

            {message && (
                <div className="message-banner" style={{
                    background: message.includes('✅') ? '#34C759' : '#FF3B30',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    fontWeight: '600'
                }}>
                    {message}
                </div>
            )}

            <div className="stats-container">
                <div className="stat-card total-value">
                    <div className="stat-icon"><FaDollarSign /></div>
                    <div className="stat-content">
                        <h3>₹{totalValue.toLocaleString()}</h3>
                        <p>Total Inventory Value</p>
                    </div>
                </div>
                <div className="stat-card best-seller">
                    <div className="stat-icon"><FaStar /></div>
                    <div className="stat-content">
                        <h3>{bestSeller}</h3>
                        <p>Best Seller</p>
                    </div>
                </div>
                <div className="stat-card low-stock">
                    <div className="stat-icon"><FaExclamationTriangle /></div>
                    <div className="stat-content">
                        <h3>{lowStockItems}</h3>
                        <p>Items Low on Stock</p>
                    </div>
                </div>
                <div className="stat-card profit">
                    <div className="stat-icon"><FaChartLine /></div>
                    <div className="stat-content">
                        <h3>₹{(analytics.salesStats.total_profit || 0).toLocaleString()}</h3>
                        <p>Total Profit</p>
                    </div>
                </div>
                <div className="stat-card sales">
                    <div className="stat-icon"><FaBoxes /></div>
                    <div className="stat-content">
                        <h3>{analytics.salesStats.total_sales || 0}</h3>
                        <p>Total Sales</p>
                    </div>
                </div>
                <div className="stat-card operational-cost">
                    <div className="stat-icon"><FaDolly /></div>
                    <div className="stat-content">
                        <h3>₹{(operationalCosts.totalOperationalCost || 0).toLocaleString()}</h3>
                        <p>Operational Costs</p>
                    </div>
                </div>
            </div>

            {/* Low Stock Alert Section */}
            {analytics.lowStockItems.length > 0 && (
                <div className="low-stock-alert" style={{
                    background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    border: '1px solid #FF3B30',
                    color: 'white'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaExclamationTriangle /> Low Stock Alert
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {analytics.lowStockItems.map((item, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{item.name}</div>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                    Stock: {item.stock} pieces
                                </div>
                                {item.dealer_contact && (
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        Contact: {item.dealer_contact}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Settings Section */}
            {showSettings && (
                <div className="settings-section">
                    <h3>⚙️ Inventory Settings</h3>
                    
                    {/* Low Stock Threshold */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h4>Stock Management</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Low Stock Alert Threshold</label>
                                <input
                                    type="number"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                                <small>You'll get alerts when items fall below this stock level</small>
                            </div>
                            <button
                                onClick={updateLowStockThreshold}
                                className="btn btn-primary"
                            >
                                Update Threshold
                            </button>
                        </div>
                    </div>

                    {/* Operational Costs */}
                    <div>
                        <h4>Operational Costs</h4>
                        
                        {/* Add New Operational Cost */}
                        <form onSubmit={addOperationalCost} className="form-grid">
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={newOperationalCost.description}
                                    onChange={(e) => setNewOperationalCost({...newOperationalCost, description: e.target.value})}
                                    placeholder="e.g., Transport cost"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    value={newOperationalCost.amount}
                                    onChange={(e) => setNewOperationalCost({...newOperationalCost, amount: e.target.value})}
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-secondary"
                            >
                                Add Cost
                            </button>
                        </form>

                        {/* Operational Costs Summary */}
                        {operationalCosts.costs.length > 0 && (
                            <div className="cost-summary">
                                <h5>Cost Summary</h5>
                                <div className="cost-cards">
                                    {operationalCosts.costs.map((cost, index) => (
                                        <div key={index} className="cost-card">
                                            <div className="cost-category">
                                                {cost.category}
                                            </div>
                                            <div className="cost-amount">
                                                ₹{(cost.total_amount || 0).toLocaleString()}
                                            </div>
                                            <div className="cost-count">
                                                {cost.transaction_count || 0} transactions
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="total-cost">
                                    <strong>
                                        Total Operational Costs: ₹{(operationalCosts.totalOperationalCost || 0).toLocaleString()}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="inventory-table-container">
                <table className="inventory-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Cost Price</th>
                            <th>Selling Price</th>
                            <th>Stock</th>
                            <th>Dealer Contact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.category}</td>
                                <td>₹{item.cost_price}</td>
                                <td>₹{item.selling_price}</td>
                                <td>{item.stock}</td>
                                <td>{item.dealer_contact}</td>
                                <td className="table-actions">
                                    <button 
                                        className="btn btn-sell" 
                                        disabled={item.stock === 0}
                                        onClick={() => handleSell(item.id)}
                                    >
                                        {item.stock === 0 ? 'Out of Stock' : 'Sell'}
                                    </button>
                                    <button className="btn btn-edit" onClick={() => handleEditClick(item)}>Edit</button>
                                    <button className="btn btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="modal-overlay">
                    <form onSubmit={handleEditSubmit} className="modal-form">
                        <h3>Edit Inventory Item</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Product Name</label>
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Cost Price (₹)</label>
                                <input
                                    type="number"
                                    value={editForm.cost_price}
                                    onChange={(e) => setEditForm({ ...editForm, cost_price: +e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Selling Price (₹)</label>
                                <input
                                    type="number"
                                    value={editForm.selling_price}
                                    onChange={(e) => setEditForm({ ...editForm, selling_price: +e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock Quantity</label>
                                <input
                                    type="number"
                                    value={editForm.stock}
                                    onChange={(e) => setEditForm({ ...editForm, stock: +e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Dealer Contact (Optional)</label>
                                <input
                                    value={editForm.dealer_contact}
                                    onChange={(e) => setEditForm({ ...editForm, dealer_contact: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" className="btn btn-cancel" onClick={() => setEditingItem(null)}>Cancel</button>
                            <button type="submit" className="btn btn-save">Save Changes</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <form onSubmit={handleAddSubmit} className="modal-form">
                        <h3>Add New Inventory Item</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Product Name</label>
                                <input
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g., Protein Powder"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Cost Price (₹)</label>
                                <input
                                    type="number"
                                    value={newItem.cost_price}
                                    onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                                    placeholder="e.g., 1500"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Selling Price (₹)</label>
                                <input
                                    type="number"
                                    value={newItem.selling_price}
                                    onChange={(e) => setNewItem({ ...newItem, selling_price: e.target.value })}
                                    placeholder="e.g., 2000"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock Quantity</label>
                                <input
                                    type="number"
                                    value={newItem.stock}
                                    onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                                    placeholder="e.g., 50"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    placeholder="e.g., Supplements"
                                    required
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Dealer Contact (Optional)</label>
                                <input
                                    value={newItem.dealer_contact}
                                    onChange={(e) => setNewItem({ ...newItem, dealer_contact: e.target.value })}
                                    placeholder="e.g., 9876543210"
                                />
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button type="button" className="btn btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-save">Add Item</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Inventory;
