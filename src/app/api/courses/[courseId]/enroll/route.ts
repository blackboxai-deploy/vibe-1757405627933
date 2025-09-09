import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

interface Params {
  courseId: string;
}

// POST /api/courses/[courseId]/enroll - Enroll in course (students only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { courseId } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course is available for student's grade
    if (!course.targetGrades.includes(user.grade)) {
      return NextResponse.json(
        { error: 'This course is not available for your grade level' },
        { status: 403 }
      );
    }

    // Check if already enrolled
    if (user.enrolledCourses.some(id => id.toString() === courseId)) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(user._id, {
      $addToSet: { enrolledCourses: courseId }
    });

    // Add to course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: user._id }
    });

    return NextResponse.json({
      message: 'Successfully enrolled in course',
    });
  } catch (error: any) {
    console.error('Course enrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId]/enroll - Unenroll from course (students only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    await connectDB();
    
    const { courseId } = await params;
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can unenroll from courses' },
        { status: 403 }
      );
    }

    // Check if enrolled
    if (!user.enrolledCourses.some(id => id.toString() === courseId)) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 400 }
      );
    }

    // Remove from user's enrolled courses
    await User.findByIdAndUpdate(user._id, {
      $pull: { enrolledCourses: courseId }
    });

    // Remove from course's enrolled students
    await Course.findByIdAndUpdate(courseId, {
      $pull: { enrolledStudents: user._id }
    });

    return NextResponse.json({
      message: 'Successfully unenrolled from course',
    });
  } catch (error: any) {
    console.error('Course unenrollment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}