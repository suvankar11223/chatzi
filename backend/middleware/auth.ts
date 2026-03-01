import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, msg: 'Access token required' });
  }

  try {
    // Try to verify as Clerk token first
    try {
      // Verify the Clerk session token
      const payload = await clerkClient.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY
      });
      
      if (payload && payload.sub) {
        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(payload.sub);
        (req as any).user = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: clerkUser.firstName || clerkUser.username || 'User',
        };
        return next();
      }
    } catch (clerkError) {
      // If Clerk verification fails, try JWT (for backward compatibility)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      (req as any).user = decoded;
      return next();
    }
  } catch (error) {
    return res.status(403).json({ success: false, msg: 'Invalid or expired token' });
  }
};

