import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromRequest, requireRole, AVAILABLE_GRADES } from '@/lib/auth';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const grade = searchParams.get('grade');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let query: any = {};
    if (role) query.role = role;
    if (grade) query.grade = grade;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        limit,
        count: users.length,
        totalUsers: total,
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role = 'student', grade } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate grade for students
    if (role === 'student' && (!grade || !AVAILABLE_GRADES.includes(grade))) {
      return NextResponse.json(
        { error: 'Valid grade selection is required for students' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const userData: any = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    if (role === 'student') {
      userData.grade = grade;
    }

    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          grade: newUser.grade,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}