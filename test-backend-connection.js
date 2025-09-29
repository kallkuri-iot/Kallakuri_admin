const axios = require('axios');

// Test the backend connection
const testBackendConnection = async () => {
  console.log('🔗 Testing connection to live backend...');
  console.log('📡 Backend URL: http://kallakuri.volvrit.org/api');
  
  try {
    // Test 1: Check if API documentation is accessible
    console.log('\n1. Testing API documentation...');
    const docsResponse = await axios.get('http://kallakuri.volvrit.org/api-docs/');
    console.log('✅ API documentation accessible:', docsResponse.status === 200);
    
    // Test 2: Try to login with admin credentials
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post('http://kallakuri.volvrit.org/api/auth/login', {
      email: 'admin@company.com',
      password: 'Admin@123456'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login successful!');
    console.log('📄 Response:', loginResponse.data);
    
    // Test 3: Try to access a protected endpoint
    if (loginResponse.data.token) {
      console.log('\n3. Testing protected endpoint...');
      const profileResponse = await axios.get('http://kallakuri.volvrit.org/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      console.log('✅ Protected endpoint accessible!');
      console.log('👤 User profile:', profileResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    console.log('🔍 Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url
    });
  }
};

// Run the test
testBackendConnection();
