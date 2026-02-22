import express from 'express';
import { AccessToken } from 'livekit-server-sdk';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/livekit/token
router.post('/token', authenticateToken, async (req: any, res) => {
  try {
    const { roomName, participantName } = req.body;

    if (!roomName || !participantName) {
      return res.status(400).json({ 
        success: false, 
        msg: 'roomName and participantName required' 
      });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ 
        success: false, 
        msg: 'LiveKit not configured' 
      });
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      ttl: '1h',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    res.json({
      success: true,
      token: jwt,
      wsUrl: process.env.LIVEKIT_WS_URL,
      roomName,
    });
  } catch (error) {
    console.error('[LiveKit] Token error:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to generate token' 
    });
  }
});

export default router;
