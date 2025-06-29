const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all inventory items
router.get("/", async (req, res) => {
    try {
        const [items] = await db.query("SELECT * FROM inventory ORDER BY name");
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching inventory." });
    }
});

// Get best sellers analytics
router.get("/analytics", async (req, res) => {
    try {
        // For now, use hardcoded threshold
        // Later you can fetch this from database
        const lowStockThreshold = 5;

        // Get best sellers by quantity sold
        const [bestSellers] = await db.query(`
            SELECT 
                product_name,
                SUM(quantity) as total_sold,
                SUM(profit) as total_profit,
                AVG(selling_price) as avg_price
            FROM sales_tracking 
            GROUP BY product_name 
            ORDER BY total_sold DESC 
            LIMIT 5
        `);

        // Get low stock items using customizable threshold
        const [lowStockItems] = await db.query(`
            SELECT name, stock, dealer_contact 
            FROM inventory 
            WHERE stock < ? 
            ORDER BY stock ASC
        `, [lowStockThreshold]);

        // Get total sales statistics
        const [salesStats] = await db.query(`
            SELECT 
                COUNT(*) as total_sales,
                SUM(quantity) as total_items_sold,
                SUM(profit) as total_profit,
                AVG(profit) as avg_profit_per_sale
            FROM sales_tracking
        `);

        res.json({
            bestSellers,
            lowStockItems,
            lowStockThreshold,
            salesStats: salesStats[0] || { total_sales: 0, total_items_sold: 0, total_profit: 0, avg_profit_per_sale: 0 }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching analytics." });
    }
});

// Sell an item
router.post("/sell/:id", async (req, res) => {
    const itemId = req.params.id;
    const paymentMethod = req.body.payment || "Cash";

    try {
        const [rows] = await db.query("SELECT * FROM inventory WHERE id = ?", [itemId]);
        const item = rows[0];

        if (!item || item.stock <= 0) {
            return res.status(400).json({ message: "Item out of stock." });
        }

        // Calculate profit
        const profit = item.selling_price - item.cost_price;

        // Update inventory stock
        await db.query("UPDATE inventory SET stock = stock - 1 WHERE id = ?", [itemId]);

        // Log sale in sales_tracking table
        await db.query(`
            INSERT INTO sales_tracking (product_id, product_name, quantity, cost_price, selling_price, profit, payment_method) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [itemId, item.name, 1, item.cost_price, item.selling_price, profit, paymentMethod]);

        // Use selling_price for the income entry in finances
        await db.query(
            "INSERT INTO finances (date, type, amount, category, payment, description) VALUES (NOW(), ?, ?, ?, ?, ?)",
            ["income", item.selling_price, "Store Sale", paymentMethod, `Sold: ${item.name}`]
        );

        res.json({ 
            message: `Sold 1 unit of ${item.name}`,
            profit: profit,
            newStock: item.stock - 1
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error processing sale." });
    }
});

// Add new inventory item
router.post("/add", async (req, res) => {
    const { name, cost_price, selling_price, stock, category, dealer_contact } = req.body;

    // Basic validation - dealer_contact is optional
    if (!name || !cost_price || !selling_price || !stock || !category) {
        return res.status(400).json({ message: "Please provide all required fields (name, cost price, selling price, stock, category)." });
    }

    try {
        await db.query(
            "INSERT INTO inventory (name, cost_price, selling_price, stock, category, dealer_contact) VALUES (?, ?, ?, ?, ?, ?)",
            [name, cost_price, selling_price, stock, category, dealer_contact || null]
        );
        
        // Log the purchase as an expense in finances
        const totalCost = cost_price * stock;
        await db.query(
            "INSERT INTO finances (date, type, amount, category, payment, description) VALUES (NOW(), ?, ?, ?, ?, ?)",
            ["expense", totalCost, "Inventory Purchase", "Cash", `Purchased: ${name} (${stock} units)`]
        );

        res.status(201).json({ message: "Item added and purchase logged as expense." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adding item." });
    }
});

// Edit inventory item
router.put("/edit/:id", async (req, res) => {
    const itemId = req.params.id;
    const { name, cost_price, selling_price, stock, category, dealer_contact } = req.body;

    try {
        await db.query(
            "UPDATE inventory SET name = ?, cost_price = ?, selling_price = ?, stock = ?, category = ?, dealer_contact = ? WHERE id = ?",
            [name, cost_price, selling_price, stock, category, dealer_contact, itemId]
        );
        res.json({ message: "Item updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating item." });
    }
});

// Add operational cost
router.post("/operational-cost", async (req, res) => {
    const { description, amount, category = "Operational Cost", payment_method = "Cash" } = req.body;

    if (!description || !amount) {
        return res.status(400).json({ message: "Description and amount are required." });
    }

    try {
        // Log as expense in finances table
        await db.query(
            "INSERT INTO finances (date, type, amount, category, payment, description) VALUES (NOW(), ?, ?, ?, ?, ?)",
            ["expense", amount, category, payment_method, `Store Operational Cost: ${description}`]
        );

        res.status(201).json({ message: "Operational cost logged successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error logging operational cost." });
    }
});

// Get operational costs summary
router.get("/operational-costs", async (req, res) => {
    try {
        const [costs] = await db.query(`
            SELECT 
                category,
                SUM(amount) as total_amount,
                COUNT(*) as transaction_count
            FROM finances 
            WHERE type = 'expense' 
            AND (category LIKE '%Operational%' OR category LIKE '%Transport%' OR category LIKE '%Packaging%')
            GROUP BY category
            ORDER BY total_amount DESC
        `);

        const [totalOperationalCost] = await db.query(`
            SELECT SUM(amount) as total
            FROM finances 
            WHERE type = 'expense' 
            AND (category LIKE '%Operational%' OR category LIKE '%Transport%' OR category LIKE '%Packaging%')
        `);

        res.json({
            costs,
            totalOperationalCost: totalOperationalCost[0]?.total || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching operational costs." });
    }
});

module.exports = router;
