const axios = require('axios');

const BASE_URL = 'https://solsparrow-backend.onrender.com/api';

async function testBackend() {
  console.log('🧪 Testing Backend and Recurring Transactions\n');

  try {
    // 1. Test if backend is running
    console.log('1. Testing backend connection...');
    const rootResponse = await axios.get(`${BASE_URL.replace('/api', '')}`);
    console.log('✅ Backend is running:', rootResponse.data);

    // 2. Test recurring transactions endpoint
    console.log('\n2. Testing recurring transactions endpoint...');
    const recurringResponse = await axios.get(`${BASE_URL}/recurring`);
    console.log('✅ Recurring transactions endpoint working');
    console.log(`   Found ${recurringResponse.data.length} recurring transactions`);

    // 3. Test process-due endpoint
    console.log('\n3. Testing process-due endpoint...');
    const processResponse = await axios.post(`${BASE_URL}/recurring/process-due`);
    console.log('✅ Process-due endpoint working:', processResponse.data.message);

    // 4. Check finances table
    console.log('\n4. Checking finances table...');
    const financesResponse = await axios.get(`${BASE_URL}/finances`);
    console.log(`✅ Finances endpoint working`);
    console.log(`   Found ${financesResponse.data.length} finance entries`);

    // 5. Look for recurring transactions in finances
    const recurringFinances = financesResponse.data.filter(entry => 
      entry.description && entry.description.includes('Auto-generated from recurring transaction')
    );
    console.log(`   Found ${recurringFinances.length} recurring transaction entries in finances`);

    if (recurringFinances.length > 0) {
      console.log('\n📋 Recurring finance entries:');
      recurringFinances.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.description}`);
        console.log(`      Date: ${entry.date}, Amount: ₹${entry.amount}, Type: ${entry.type}`);
      });
    }

    console.log('\n🎉 All tests passed! Backend is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend is not running. Please start it with:');
      console.log('   cd backend && npm start');
    }
  }
}

testBackend(); 