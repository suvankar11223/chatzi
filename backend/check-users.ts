import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modals/userModal.js';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connected to MongoDB');

    const users = await User.find({}).select('name email');
    
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE USERS CHECK');
    console.log('='.repeat(60));
    console.log(`Total users in database: ${users.length}`);
    
    if (users.length === 0) {
      console.log('\n❌ NO USERS FOUND IN DATABASE!');
      console.log('\n💡 Solution: Run the seed script to create test users:');
      console.log('   npm run seed');
    } else {
      console.log('\n✅ Users found:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    }
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsers();
