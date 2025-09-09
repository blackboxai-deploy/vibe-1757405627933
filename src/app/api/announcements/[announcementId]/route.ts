import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Announcement from '@/lib/models/Announcement';
import { getUserFromRequest, requireRole } from '@/lib/auth';

interface Params {
  announcementId: string;
}

// GET /api/announcements/[announcementId] - Get specific announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { announcementId } = await params;
    const user = await getUserFromRequest(request);
    
    const announcement = await Announcement.findById(announcementId)
      .populate('author', 'name email role');
      
    if (!announcement || !announcement.isActive) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this announcement
    if (user?.role === 'student') {
      if (!announcement.targetGrades.includes(user.grade)) {
        return NextResponse.json(
          { error: 'Access denied to this announcement' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ announcement });
  } catch (error: any) {
    console.error('Get announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[announcementId] - Update announcement (admin/teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { announcementId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin', 'teacher'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Teachers can only edit their own announcements, admins can edit any
    if (user!.role === 'teacher' && announcement.author.toString() !== user!._id) {
      return NextResponse.json(
        { error: 'You can only edit your own announcements' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates = { ...body };
    delete updates._id; // Don't allow ID changes
    delete updates.author; // Don't allow author changes

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      announcementId,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name email role');

    return NextResponse.json({
      message: 'Announcement updated successfully',
      announcement: updatedAnnouncement,
    });
  } catch (error: any) {
    console.error('Update announcement error:', error);
    
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

// DELETE /api/announcements/[announcementId] - Delete announcement (admin/teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { announcementId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin', 'teacher'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    // Teachers can only delete their own announcements, admins can delete any
    if (user!.role === 'teacher' && announcement.author.toString() !== user!._id) {
      return NextResponse.json(
        { error: 'You can only delete your own announcements' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Announcement.findByIdAndUpdate(announcementId, { isActive: false });

    return NextResponse.json({
      message: 'Announcement deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}