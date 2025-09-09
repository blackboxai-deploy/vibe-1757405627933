import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Announcement from '@/lib/models/Announcement';
import { getUserFromRequest, requireRole } from '@/lib/auth';

// GET /api/announcements - Get announcements (filtered by user role/grade)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    
    let query: any = { isActive: true };
    
    if (user?.role === 'student') {
      // Students see announcements for their grade only
      query.targetGrades = { $in: [user.grade] };
    } else if (user?.role === 'teacher') {
      // Teachers see all announcements they created
      const authorId = searchParams.get('author');
      if (authorId === 'me') {
        query.author = user._id;
      }
    } else if (grade) {
      // Filter by specific grade if provided (admin view)
      query.targetGrades = { $in: [grade] };
    }
    
    const announcements = await Announcement.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent

    return NextResponse.json({ announcements });
  } catch (error: any) {
    console.error('Get announcements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create new announcement (admin/teacher only)
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
    const { title, content, link, targetGrades } = body;

    // Validate required fields
    if (!title || !content || !targetGrades || targetGrades.length === 0) {
      return NextResponse.json(
        { error: 'Title, content, and target grades are required' },
        { status: 400 }
      );
    }

    const announcement = new Announcement({
      title: title.trim(),
      content: content.trim(),
      link: link?.trim() || undefined,
      targetGrades,
      author: user!._id,
    });

    await announcement.save();
    await announcement.populate('author', 'name email role');

    return NextResponse.json(
      {
        message: 'Announcement created successfully',
        announcement,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create announcement error:', error);
    
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