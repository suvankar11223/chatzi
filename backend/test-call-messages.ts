import mongoose from 'mongoose';
import Message from './modals/Message.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkCallMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connected to MongoDB');

    // Find all call messages
    const callMessages = await Message.find({ isCallMessage: true })
      .populate('senderId', 'name email')
      .populate('conversationId')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('\n========== CALL MESSAGES IN DATABASE ==========');
    console.log(`Found ${callMessages.length} call messages\n`);

    callMessages.forEach((msg: any, index) => {
      console.log(`--- Message ${index + 1} ---`);
      console.log('ID:', msg._id);
      console.log('Conversation ID:', msg.conversationId?._id || msg.conversationId);
      console.log('Sender:', msg.senderId?.name, `(${msg.senderId?.email})`);
      console.log('Call Type:', msg.callData?.type);
      console.log('Duration:', msg.callData?.duration, 'seconds');
      console.log('Status:', msg.callData?.status);
      console.log('Created:', msg.createdAt);
      console.log('');
    });

    // Find all messages (including call messages) for recent conversations
    const allMessages = await Message.find()
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log('\n========== RECENT MESSAGES (ALL TYPES) ==========');
    console.log(`Total recent messages: ${allMessages.length}\n`);

    allMessages.forEach((msg: any, index) => {
      console.log(`${index + 1}. ${msg.isCallMessage ? '[CALL]' : '[TEXT]'} ${msg.senderId?.name}: ${msg.content || 'Call message'} (${msg.createdAt})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCallMessages();
