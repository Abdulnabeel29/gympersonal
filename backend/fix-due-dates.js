const db = require('./db');

async function fixDueDates() {
  try {
    console.log('🔄 Fixing recurring transaction due dates...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Update all active recurring transactions to be due today
    const [result] = await db.execute(`
      UPDATE recurring_transactions 
      SET next_due_date = ?, is_active = TRUE 
      WHERE is_active = TRUE
    `, [today]);
    
    console.log(`✅ Updated ${result.affectedRows} transactions to be due today (${today})`);
    
    // Show the updated transactions
    const [transactions] = await db.execute(`
      SELECT id, name, next_due_date, is_active 
      FROM recurring_transactions 
      WHERE is_active = TRUE
    `);
    
    console.log('\nUpdated transactions:');
    transactions.forEach(t => {
      console.log(`- ${t.name}: Due ${t.next_due_date}, Active: ${t.is_active}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing due dates:', error);
  } finally {
    process.exit(0);
  }
}

fixDueDates(); 