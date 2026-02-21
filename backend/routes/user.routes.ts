import express from 'express';
import { updateProfile, getProfile, ensureStreamUsers, getAllUsers, getContacts, getMessages, createConversationAPI } from '../controller/user.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/ensure-stream-users', authenticateToken, ensureStreamUsers);
router.get('/all', authenticateToken, getAllUsers);
router.get('/contacts', authenticateToken, getContacts);
router.get('/messages/:conversationId', authenticateToken, getMessages);
router.post('/conversations', authenticateToken, createConversationAPI);

export default router;
