import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email?: string;
  name?: string;
}

/**
 * Generate a JWT token for a user
 * @param userId - The user's MongoDB ObjectId as a string
 * @param email - Optional user email
 * @param name - Optional user name
 */
export const generateToken = (
  userId: string, 
  email?: string, 
  name?: string
): string => {
  const payload: TokenPayload = {
    userId,
    email,
    name
  };

  // Generate token with 7 days expiry for production use
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  });
};

/**
 * Verify a JWT token and return the decoded payload
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error("[DEBUG] Token verification failed:", error);
    return null;
  }
};
