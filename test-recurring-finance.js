const axios = require('axios');

const BASE_URL = 'https://solsparrow-backend.onrender.com/api';

async function testRecurringFinanceIntegration() {
  console.log('🧪 Testing Recurring Transactions Integration with View Finances\n');

  try {
    // 1. Create a recurring transaction
    console.log('1. Creating a recurring transaction...');
    const recurringTransaction = {
      name: "Monthly Gym Rent",
      type: "expense",
      amount: 5000,
      category: "Rent",
      payment: "Bank Transfer",
      description: "Monthly rent payment for gym space",
      frequency: "monthly",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      staff_id: null
    };

    const createResponse = await axios.post(`${BASE_URL}/recurring`, recurringTransaction);
    console.log('✅ Recurring transaction created:', createResponse.data.name);

    // 2. Process due transactions (this adds entries to finances table)
    console.log('\n2. Processing due transactions...');
    const processResponse = await axios.post(`${BASE_URL}/recurring/process-due`);
    console.log('✅ Processed transactions:', processResponse.data.message);

    // 3. Check finances table to see the new entries
    console.log('\n3. Checking finances table...');
    const financesResponse = await axios.get(`${BASE_URL}/finances`);
    const financeEntries = financesResponse.data;
    
    console.log(`📊 Total finance entries: ${financeEntries.length}`);
    
    // Find recurring transactions
    const recurringEntries = financeEntries.filter(entry => 
      entry.description && entry.description.includes('Auto-generated from recurring transaction')
    );
    
    console.log(`🔄 Recurring transaction entries: ${recurringEntries.length}`);
    
    if (recurringEntries.length > 0) {
      console.log('\n📋 Recurring transaction details:');
      recurringEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.description}`);
        console.log(`      Date: ${entry.date}, Amount: ₹${entry.amount}, Type: ${entry.type}`);
      });
    }

    // 4. Show summary statistics
    const totalIncome = financeEntries
      .filter(e => e.type === "income")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalExpense = financeEntries
      .filter(e => e.type === "expense")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const recurringAmount = recurringEntries
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    console.log('\n📈 Summary Statistics:');
    console.log(`   Total Income: ₹${totalIncome}`);
    console.log(`   Total Expense: ₹${totalExpense}`);
    console.log(`   Balance: ₹${totalIncome - totalExpense}`);
    console.log(`   Recurring Transactions: ${recurringEntries.length} entries (₹${recurringAmount})`);

    console.log('\n🎉 Test completed successfully!');
    console.log('\n💡 How it works:');
    console.log('   1. Recurring transactions are created in the Recurring Transactions page');
    console.log('   2. When you click "Process Recurring" in View Finances, due transactions are processed');
    console.log('   3. Processed transactions automatically appear in View Finances with special indicators');
    console.log('   4. Recurring entries are marked with 🔄 icon and purple styling');
    console.log('   5. The summary shows count and total amount of recurring transactions');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testRecurringFinanceIntegration(); 