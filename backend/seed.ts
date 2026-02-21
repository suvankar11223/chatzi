import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './modals/userModal.js';

dotenv.config();

const testUsers = [
  {
    name: 'Tini',
    email: 'tini@test.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Tini',
  },
  {
    name: 'Suvankar',
    email: 'suvankar@test.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Suvankar',
  },
  {
    name: 'bdbb',
    email: 'bdbb@test.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=bdbb',
  },
  {
    name: 'Krish',
    email: 'krish@test.com',
    password: 'password123',
    avatar: 'https://api.dicebear.com/7.x/adventurer/png?seed=Krish',
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connected to MongoDB');

    // Delete ALL users from the database
    const deleteResult = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing users`);

    // Create test users
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        avatar: userData.avatar,
      });

      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log('Email: tini@test.com | Password: password123');
    console.log('Email: suvankar@test.com | Password: password123');
    console.log('Email: bdbb@test.com | Password: password123');
    console.log('Email: krish@test.com | Password: password123');
    console.log('\n💡 You can now login with any of these accounts!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
