import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import { getUserFromRequest, requireRole } from '@/lib/auth';

// GET /api/courses - Get all courses (public/filtered by role)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    
    let query: any = { isActive: true };
    
    // If user is a student, filter by their grade
    if (user?.role === 'student' && user.grade) {
      query.targetGrades = { $in: [user.grade] };
    } else if (grade) {
      // Filter by specific grade if provided
      query.targetGrades = { $in: [grade] };
    }
    
    const courses = await Course.find(query)
      .populate('createdBy', 'name email')
      .select('-lessons.transcription -lessons.summary') // Don't include full lesson data
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error: any) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course (admin/teacher only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin', 'teacher'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, targetGrades, lessons = [] } = body;

    // Validate required fields
    if (!title || !description || !targetGrades || targetGrades.length === 0) {
      return NextResponse.json(
        { error: 'Title, description, and target grades are required' },
        { status: 400 }
      );
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      targetGrades,
      lessons,
      createdBy: user!._id,
    });

    await course.save();
    await course.populate('createdBy', 'name email');

    return NextResponse.json(
      {
        message: 'Course created successfully',
        course,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create course error:', error);
    
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