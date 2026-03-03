import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const testContactsAPI = async () => {
  try {
    console.log('Testing Contacts API...\n');
    
    // Test data for both Google users
    const users = [
      {
        name: 'Suvankar',
        email: 'sangha.nayak18@gmail.com',
        clerkId: 'user_3ALfTxQ4uctDn1WCsMEAhX0ghhW',
        mongoId: '69a469aca3c5f65b436029dc'
      },
      {
        name: 'AMAN',
        email: 'amanzade9158@gmail.com',
        clerkId: 'user_3AQagTuAE78EU37zYdJKEpActey',
        mongoId: '69a69f45909a5fb354f12d8b'
      }
    ];

    const API_URL = process.env.API_URL || 'http://localhost:3000';
    
    console.log('API URL:', API_URL);
    console.log('='.repeat(60));
    
    for (const user of users) {
      console.log(`\nTesting as: ${user.name} (${user.email})`);
      console.log('-'.repeat(60));
      
      // Note: In production, you would need a valid Clerk token
      // This is just to show what the API should return
      console.log(`Expected: Should return all users EXCEPT ${user.name}`);
      console.log(`Expected count: 22 users (23 total - 1 current user)`);
      console.log(`Should include: ${users.find(u => u.email !== user.email)?.name}`);
      console.log('');
    }
    
    console.log('='.repeat(60));
    console.log('\nTo test with real tokens:');
    console.log('1. Login as User A in the app');
    console.log('2. Get the token from AsyncStorage');
    console.log('3. Make API call:');
    console.log(`   curl -H "Authorization: Bearer <token>" ${API_URL}/api/user/contacts`);
    console.log('');
    console.log('Expected response:');
    console.log('{');
    console.log('  "success": true,');
    console.log('  "data": [');
    console.log('    { "_id": "...", "name": "...", "email": "...", "avatar": "..." },');
    console.log('    ...');
    console.log('  ]');
    console.log('}');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testContactsAPI();
