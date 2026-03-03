import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './modals/userModal.js';

dotenv.config();

const checkGoogleUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB');

    console.log('\n='.repeat(60));
    console.log('CHECKING ALL USERS IN DATABASE');
    console.log('='.repeat(60));

    const users = await User.find({});
    
    console.log(`\nTotal users in database: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - MongoDB ID: ${user._id}`);
      console.log(`  - Clerk ID: ${user.clerkId || 'N/A'}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Avatar: ${user.avatar || 'NO AVATAR'}`);
      console.log(`  - Created: ${user.createdAt}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('GOOGLE USERS (with Clerk ID):');
    console.log('='.repeat(60));

    const googleUsers = users.filter(u => u.clerkId);
    console.log(`\nGoogle users: ${googleUsers.length}\n`);

    googleUsers.forEach((user, index) => {
      console.log(`Google User ${index + 1}:`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Avatar: ${user.avatar || 'NO AVATAR'}`);
      console.log('');
    });

    console.log('='.repeat(60));
    console.log('ANALYSIS');
    console.log('='.repeat(60));
    console.log(`Total users: ${users.length}`);
    console.log(`Google users (with Clerk ID): ${googleUsers.length}`);
    console.log(`Email/password users: ${users.length - googleUsers.length}`);
    console.log(`Users with avatars: ${users.filter(u => u.avatar).length}`);
    console.log(`Users without avatars: ${users.filter(u => !u.avatar).length}`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkGoogleUsers();
