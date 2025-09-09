import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import User, { IUser } from './models/User';
import connectDB from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

// Generate JWT token
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get user from request (for API routes)
export async function getUserFromRequest(request: NextRequest): Promise<IUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Middleware for role-based access
export function requireRole(roles: string[]) {
  return async (_request: NextRequest, user: IUser | null) => {
    if (!user) {
      return { authorized: false, error: 'Authentication required' };
    }

    if (!roles.includes(user.role)) {
      return { authorized: false, error: 'Insufficient permissions' };
    }

    return { authorized: true, user };
  };
}

// Grade constants
export const AVAILABLE_GRADES = [
  'Pemula (7-9 tahun)',
  'Grade 4',
  'Grade 5', 
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Dewasa',
];

// Hash password utility (if needed outside of model)
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}