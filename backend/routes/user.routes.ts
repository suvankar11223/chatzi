import express from 'express';
import { updateProfile, getProfile, ensureStreamUsers, getAllUsers, getContacts, getMessages, createConversationAPI, getConversations } from '../controller/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import User from '../modals/userModal.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/ensure-stream-users', authenticateToken, ensureStreamUsers);
router.get('/all', authenticateToken, getAllUsers);
router.get('/contacts', authenticateToken, getContacts);
router.get('/conversations', authenticateToken, getConversations);
router.get('/messages/:conversationId', authenticateToken, getMessages);
router.post('/conversations', authenticateToken, createConversationAPI);

// Debug endpoint to list ALL users in database (no auth required for testing)
router.get('/debug-all-users', async (_req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users.map(u => ({ _id: u._id, name: u.name, email: u.email }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, msg: error.message });
  }
});

export default router;
