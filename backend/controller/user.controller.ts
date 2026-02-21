import { Request, Response } from 'express';
import User from '../modals/userModal.js';
import { createStreamUser } from '../services/streamService.js';

export const ensureStreamUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, msg: 'userIds array is required' });
    }

    console.log('[DEBUG] ensureStreamUsers: Creating StreamChat users for:', userIds);
    
    const results = [];
    
    for (const userId of userIds) {
      try {
        const user = await User.findById(userId);
        if (user) {
          await createStreamUser(userId, user.name, user.avatar);
          results.push({ userId, success: true });
          console.log('[DEBUG] ensureStreamUsers: Created user:', userId);
        } else {
          results.push({ userId, success: false, msg: 'User not found' });
        }
      } catch (error: any) {
        console.error('[DEBUG] ensureStreamUsers: Error for user', userId, error);
        results.push({ userId, success: false, msg: error.message });
      }
    }
    
    res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error('[DEBUG] ensureStreamUsers: Error:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const userEmail = (req as any).user.email;
    const { name, email, avatar } = req.body;

    console.log('='.repeat(60));
    console.log('[DEBUG] updateProfile: Request received');
    console.log('[DEBUG] User ID:', userId);
    console.log('[DEBUG] User Email:', userEmail);
    console.log('[DEBUG] Token payload:', (req as any).user);
    console.log('[DEBUG] Update data:', { name, email, avatar });
    console.log('[DEBUG] Avatar received:', avatar ? 'YES' : 'NO');
    if (avatar) {
      console.log('[DEBUG] Avatar URL:', avatar);
      console.log('[DEBUG] Avatar type:', typeof avatar);
      console.log('[DEBUG] Avatar length:', avatar.length);
    }
    console.log('='.repeat(60));

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      console.log('[DEBUG] updateProfile: User not found', userId);
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    console.log('[DEBUG] updateProfile: Current user data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('[DEBUG] updateProfile: Email already in use', email);
        return res.status(400).json({ success: false, msg: 'Email already in use' });
      }
      user.email = email;
    }

    // Update fields
    if (name) {
      console.log('[DEBUG] updateProfile: Updating name from', user.name, 'to', name);
      user.name = name;
    }
    if (avatar !== undefined) {
      console.log('[DEBUG] updateProfile: Updating avatar');
      console.log('[DEBUG] Old avatar:', user.avatar || 'null');
      console.log('[DEBUG] New avatar:', avatar || 'null');
      user.avatar = avatar;
    }

    await user.save();

    console.log('[DEBUG] updateProfile: Profile updated successfully');
    console.log('[DEBUG] Updated user data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
    console.log('[DEBUG] Avatar saved to database:', user.avatar ? 'YES' : 'NO');
    if (user.avatar) {
      console.log('[DEBUG] Saved avatar URL:', user.avatar);
    }
    console.log('='.repeat(60));

    res.status(200).json({
      success: true,
      msg: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[ERROR] Update profile:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('[ERROR] Get profile:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error: any) {
    console.error('[ERROR] Get all users:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.userId;
    const currentUserEmail = (req as any).user.email;
    
    console.log('='.repeat(60));
    console.log('[DEBUG] getContacts API: Request received');
    console.log('[DEBUG] Current user ID:', currentUserId);
    console.log('[DEBUG] Current user email:', currentUserEmail);
    
    // Get all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
    
    console.log('[DEBUG] getContacts API: Found', users.length, 'contacts (excluding current user)');
    
    if (users.length > 0) {
      console.log('[DEBUG] Contact names:', users.map(u => u.name).join(', '));
      console.log('[DEBUG] Contact emails:', users.map(u => u.email).join(', '));
    } else {
      console.log('[DEBUG] WARNING: No other users found in database!');
    }
    
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    }));

    console.log('[DEBUG] getContacts API: Returning', formattedUsers.length, 'contacts');
    console.log('='.repeat(60));

    res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error: any) {
    console.error('='.repeat(60));
    console.error('[ERROR] Get contacts API:', error);
    console.error('='.repeat(60));
    res.status(500).json({ success: false, msg: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = (req as any).user.userId;
    
    console.log('[DEBUG] getMessages API: User:', currentUserId, 'Conversation:', conversationId);
    
    const Message = (await import('../modals/Message.js')).default;
    const Conversation = (await import('../modals/Conversation.js')).default;
    
    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, msg: 'Conversation not found' });
    }
    
    const isParticipant = conversation.participants.some((p: any) => p.toString() === currentUserId);
    if (!isParticipant) {
      return res.status(403).json({ success: false, msg: 'Not authorized' });
    }
    
    // Get messages
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name avatar')
      .lean();
    
    const formattedMessages = messages.map((msg: any) => ({
      id: msg._id,
      content: msg.content,
      attachment: msg.attachment,
      createdAt: msg.createdAt,
      sender: {
        id: msg.senderId._id,
        name: msg.senderId.name,
        avatar: msg.senderId.avatar,
      },
    }));
    
    console.log('[DEBUG] getMessages API: Returning', formattedMessages.length, 'messages');
    
    res.status(200).json({
      success: true,
      data: formattedMessages,
    });
  } catch (error: any) {
    console.error('[ERROR] Get messages:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};

// API endpoint to create conversation (fallback when socket is not available)
export const createConversationAPI = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.userId;
    const { type, participants } = req.body;
    
    console.log('[DEBUG] createConversationAPI: User:', currentUserId, 'Type:', type);
    
    const Conversation = (await import('../modals/Conversation.js')).default;
    const User = (await import('../modals/userModal.js')).default;
    
    // For direct conversations, check if it already exists
    if (type === 'direct' && participants && participants.length >= 2) {
      const otherUserId = participants.find((p: string) => p !== currentUserId);
      
      // Find existing conversation
      const existingConv = await Conversation.findOne({
        type: 'direct',
        participants: { $all: [currentUserId, otherUserId] }
      });
      
      if (existingConv) {
        // Return existing conversation populated
        const populatedConv = await Conversation.findById(existingConv._id)
          .populate('participants', 'name avatar email')
          .populate('lastMessage');
        
        return res.status(200).json({
          success: true,
          data: populatedConv,
        });
      }
    }
    
    // Create new conversation
    const newConversation = await Conversation.create({
      type: type || 'direct',
      participants: participants || [currentUserId],
    });
    
    console.log('[DEBUG] createConversationAPI: Created new conversation:', newConversation._id);
    
    // Populate and return
    const populatedConv = await Conversation.findById(newConversation._id)
      .populate('participants', 'name avatar email')
      .populate('lastMessage');
    
    res.status(201).json({
      success: true,
      data: populatedConv,
    });
  } catch (error: any) {
    console.error('[ERROR] Create conversation API:', error);
    res.status(500).json({ success: false, msg: error.message });
  }
};
