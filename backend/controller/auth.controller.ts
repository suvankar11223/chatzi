import { Request, Response } from "express";
import User from "../modals/userModal.js";
import { generateToken } from "../utils/token.js";

interface AuthRequest extends Request {
  userId?: string;
}

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password, name, avatar } = req.body;

  // Debug: Log incoming request
  console.log("[DEBUG] Register request received:", { email, name });

  // Validate input
  if (!email || !password || !name) {
    res.status(400).json({ 
      success: false, 
      msg: "Please provide all required fields: email, password, name" 
    });
    return;
  }

  // Validate email format
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ 
      success: false, 
      msg: "Please provide a valid email address" 
    });
    return;
  }

  // Validate password length
  if (password.length < 6) {
    res.status(400).json({ 
      success: false, 
      msg: "Password must be at least 6 characters long" 
    });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log("[DEBUG] User already exists:", email);
      res.status(400).json({ success: false, msg: "User with this email already exists" });
      return;
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: name.trim(),
      avatar: avatar || "",
      created: new Date()
    });

    await user.save();
    console.log("[DEBUG] User created successfully:", user._id);

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.name);

    res.status(201).json({ 
      success: true, 
      msg: "User registered successfully", 
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        created: user.created
      }
    });
  } catch (error: any) {
    console.error("[DEBUG] Register error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ 
        success: false, 
        msg: messages.join(", ") 
      });
      return;
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      res.status(400).json({ 
        success: false, 
        msg: "User with this email already exists" 
      });
      return;
    }

    res.status(500).json({ success: false, msg: "Server error during registration" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Debug: Log incoming request
  console.log("[DEBUG] Login request received:", { email });

  // Validate input
  if (!email || !password) {
    res.status(400).json({ 
      success: false, 
      msg: "Please provide email and password" 
    });
    return;
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log("[DEBUG] User not found:", email);
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    // Check password using bcrypt compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("[DEBUG] Password mismatch for:", email);
      res.status(400).json({ success: false, msg: "Invalid credentials" });
      return;
    }

    console.log("[DEBUG] Login successful:", user._id);

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.email, user.name);

    res.status(200).json({ 
      success: true, 
      msg: "Login successful", 
      token,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        created: user.created
      }
    });
  } catch (error: any) {
    console.error("[DEBUG] Login error:", error);
    res.status(500).json({ success: false, msg: "Server error during login" });
  }
};
