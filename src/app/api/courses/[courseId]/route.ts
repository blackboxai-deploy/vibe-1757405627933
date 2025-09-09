import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { getUserFromRequest, requireRole } from '@/lib/auth';

interface Params {
  courseId: string;
}

// GET /api/courses/[courseId] - Get course details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { courseId } = await params;
    const user = await getUserFromRequest(request);
    
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email');
      
    if (!course || !course.isActive) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this course
    if (user?.role === 'student') {
      // Students can only access courses for their grade and enrolled courses
      const hasGradeAccess = course.targetGrades.includes(user.grade);
      const isEnrolled = user.enrolledCourses.some(
        (enrolledId) => enrolledId.toString() === courseId
      );
      
      if (!hasGradeAccess && !isEnrolled) {
        return NextResponse.json(
          { error: 'Access denied to this course' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ course });
  } catch (error: any) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[courseId] - Update course (admin/teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { courseId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin', 'teacher'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Teachers can only edit their own courses, admins can edit any
    if (user!.role === 'teacher' && course.createdBy.toString() !== user!._id) {
      return NextResponse.json(
        { error: 'You can only edit your own courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates = { ...body };
    delete updates._id; // Don't allow ID changes
    delete updates.createdBy; // Don't allow creator changes

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse,
    });
  } catch (error: any) {
    console.error('Update course error:', error);
    
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

// DELETE /api/courses/[courseId] - Delete course (admin/teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { courseId } = await params;
    const user = await getUserFromRequest(request);
    const roleCheck = await requireRole(['admin', 'teacher'])(request, user);
    
    if (!roleCheck.authorized) {
      return NextResponse.json(
        { error: roleCheck.error },
        { status: 403 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Teachers can only delete their own courses, admins can delete any
    if (user!.role === 'teacher' && course.createdBy.toString() !== user!._id) {
      return NextResponse.json(
        { error: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await Course.findByIdAndUpdate(courseId, { isActive: false });

    // Remove from enrolled students
    await User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );

    return NextResponse.json({
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}