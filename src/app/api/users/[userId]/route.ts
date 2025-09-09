import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { getUserFromRequest, requireRole, AVAILABLE_GRADES } from '@/lib/auth';

interface Params {
  userId: string;
}

// GET /api/users/[userId] - Get specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { userId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(userId)
      .select('-password')
      .populate('enrolledCourses', 'title description');
      
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: targetUser });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[userId] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { userId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, email, role, grade, password } = body;

    // Validate grade for students
    if (role === 'student' && grade && !AVAILABLE_GRADES.includes(grade)) {
      return NextResponse.json(
        { error: 'Invalid grade selection' },
        { status: 400 }
      );
    }

    // Check if email is being changed and doesn't conflict
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 400 }
        );
      }
    }

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (role) updates.role = role;
    if (role === 'student' && grade) updates.grade = grade;
    if (role !== 'student') updates.grade = undefined; // Clear grade for non-students
    
    // Handle password update separately if provided
    if (password) {
      // Password will be hashed by the pre-save middleware
      updates.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    
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

// DELETE /api/users/[userId] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { userId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    // Prevent admin from deleting themselves
    if (user!._id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove user from all courses
    const { default: Course } = await import('@/lib/models/Course');
    await Course.updateMany(
      { enrolledStudents: userId },
      { $pull: { enrolledStudents: userId } }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}