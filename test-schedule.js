// Test script for Schedule functionality
const axios = require('axios');

const BASE_URL = 'https://solsparrow-backend.onrender.com/api';

async function testScheduleFunctionality() {
  console.log('🧪 Testing Schedule Functionality...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthCheck = await axios.get(`${BASE_URL}/schedule`);
    console.log('✅ Server is running and schedule endpoint is accessible\n');

    // Test 2: Test adding a booking
    console.log('2. Testing booking creation...');
    const newBooking = {
      day: 'Mon',
      time: '6:00 AM',
      member: 'Test Member',
      category: 'Yoga',
      trainer: 'Test Trainer'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/schedule`, newBooking);
    console.log('✅ Booking created successfully:', createResponse.data);
    
    const bookingId = createResponse.data.id;
    console.log(`   Booking ID: ${bookingId}\n`);

    // Test 3: Test updating a booking
    console.log('3. Testing booking update...');
    const updateData = {
      day: 'Mon',
      time: '6:00 AM',
      member: 'Updated Test Member',
      category: 'Zumba',
      trainer: 'Updated Trainer'
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/schedule/${bookingId}`, updateData);
    console.log('✅ Booking updated successfully:', updateResponse.data, '\n');

    // Test 4: Test fetching all bookings
    console.log('4. Testing fetch all bookings...');
    const fetchResponse = await axios.get(`${BASE_URL}/schedule`);
    console.log('✅ Fetched bookings:', fetchResponse.data, '\n');

    // Test 5: Test deleting individual booking
    console.log('5. Testing individual booking deletion...');
    const deleteResponse = await axios.delete(`${BASE_URL}/schedule/${bookingId}`);
    console.log('✅ Individual booking deleted successfully:', deleteResponse.data, '\n');

    // Test 6: Test reset schedule (delete all)
    console.log('6. Testing schedule reset...');
    const resetResponse = await axios.delete(`${BASE_URL}/schedule`);
    console.log('✅ Schedule reset successfully:', resetResponse.data, '\n');

    console.log('🎉 All tests passed! Schedule functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 5000');
      console.log('   Run: cd backend && npm start');
    }
  }
}

// Run the tests
testScheduleFunctionality(); 