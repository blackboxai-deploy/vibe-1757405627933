'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  transcription: string;
  summary: string;
  resources: string[];
  duration?: number;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  targetGrades: string[];
  lessons: Lesson[];
  createdBy: {
    name: string;
    email: string;
  };
  enrolledStudents: string[];
  isActive: boolean;
}

function CoursePlayer() {
  const params = useParams();
  const { user } = useAuth();
  const courseId = params?.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    if (course && user) {
      // Check if user is enrolled
      const enrolled = user.enrolledCourses?.includes(course._id) || 
                     course.enrolledStudents.includes(user.id);
      setIsEnrolled(enrolled);
      
      // Set first lesson as current if enrolled
      if (enrolled && course.lessons.length > 0) {
        const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
        setCurrentLesson(sortedLessons[0]);
      }
    }
  }, [course, user]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCourse(data.course);
      } else {
        setError(data.error || 'Failed to load course');
      }
    } catch (err) {
      setError('Failed to load course');
      console.error('Fetch course error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || user.role !== 'student') {
      setError('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsEnrolled(true);
        setError('');
        // Refresh course data
        await fetchCourse();
      } else {
        setError(data.error || 'Failed to enroll in course');
      }
    } catch (err) {
      setError('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'Unknown duration';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002394]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation variant="authenticated" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation variant="authenticated" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600">Course not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation variant="authenticated" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="font-poppins text-3xl font-bold text-[#212121] mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-2">
                by {course.createdBy?.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {course.targetGrades.map((grade) => (
                  <Badge key={grade} variant="outline">
                    {grade}
                  </Badge>
                ))}
              </div>
            </div>
            
            {!isEnrolled && user?.role === 'student' && (
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-[#002394] hover:bg-[#001a73] text-white px-6"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </Button>
              </div>
            )}
          </div>
          
          <p className="text-gray-700 leading-relaxed">
            {course.description}
          </p>
        </div>

        {!isEnrolled && user?.role === 'student' ? (
          <Card className="border-gray-100">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-poppins text-xl font-medium text-gray-600 mb-2">
                Enrollment Required
              </h3>
              <p className="text-gray-500 mb-6">
                You need to enroll in this course to access the lessons and content.
              </p>
              <Button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-[#002394] hover:bg-[#001a73] text-white px-8 py-3"
                size="lg"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentLesson ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <Card className="border-gray-100">
                    <CardContent className="p-6">
                      <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
                        {currentLesson.videoUrl ? (
                          <video
                            controls
                            className="w-full h-full rounded-lg"
                            src={currentLesson.videoUrl}
                          >
                            <source src={currentLesson.videoUrl} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="text-gray-400 text-center">
                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 110 5H9m3.75-5a2.5 2.5 0 110 5m-2.5 0H12m.75-5H10.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Video placeholder - Demo content</p>
                            <p className="text-sm">
                              Video URL: {currentLesson.videoUrl || 'Not provided'}
                            </p>
                          </div>
                        )}
                      </div>
                      <h2 className="font-poppins text-xl font-bold text-[#212121]">
                        {currentLesson.title}
                      </h2>
                      {currentLesson.duration && (
                        <p className="text-sm text-gray-500 mt-1">
                          Duration: {formatDuration(currentLesson.duration)}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Tabbed Content */}
                  <Card className="border-gray-100">
                    <CardContent className="p-6">
                      <Tabs defaultValue="transcription" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="transcription">Transcription</TabsTrigger>
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="resources">Resources</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="transcription" className="mt-6">
                          <div className="prose max-w-none">
                            <h3 className="font-poppins text-lg font-semibold text-[#212121] mb-4">
                              Video Transcription
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                              {currentLesson.transcription ? (
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {currentLesson.transcription}
                                </p>
                              ) : (
                                <p className="text-gray-500 italic">
                                  Transcription not available for this lesson.
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="summary" className="mt-6">
                          <div className="prose max-w-none">
                            <h3 className="font-poppins text-lg font-semibold text-[#212121] mb-4">
                              Lesson Summary
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              {currentLesson.summary ? (
                                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {currentLesson.summary}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">
                                  Summary not available for this lesson.
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="resources" className="mt-6">
                          <div className="prose max-w-none">
                            <h3 className="font-poppins text-lg font-semibold text-[#212121] mb-4">
                              Supplementary Resources
                            </h3>
                            <div className="space-y-3">
                              {currentLesson.resources && currentLesson.resources.length > 0 ? (
                                currentLesson.resources.map((resource, index) => (
                                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                    <svg className="h-5 w-5 text-[#008080] mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <a
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[#008080] hover:text-[#006666] underline"
                                    >
                                      {resource}
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                                  No additional resources available for this lesson.
                                </p>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-gray-100">
                  <CardContent className="py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-poppins text-xl font-medium text-gray-600 mb-2">
                      No lessons available
                    </h3>
                    <p className="text-gray-500">
                      Lessons will appear here when they are added to the course.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Lessons Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-gray-100 sticky top-8">
                <CardHeader>
                  <CardTitle className="font-poppins text-lg text-[#212121]">
                    Course Lessons
                  </CardTitle>
                  <CardDescription>
                    {sortedLessons.length} lesson{sortedLessons.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sortedLessons.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No lessons available
                      </p>
                    ) : (
                      sortedLessons.map((lesson, index) => (
                        <button
                          key={lesson._id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                            currentLesson?._id === lesson._id
                              ? 'border-[#002394] bg-[#002394] bg-opacity-5'
                              : 'border-gray-200 hover:border-[#002394] hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className={`text-sm font-medium ${
                                currentLesson?._id === lesson._id
                                  ? 'text-[#002394]'
                                  : 'text-[#212121]'
                              }`}>
                                {index + 1}. {lesson.title}
                              </div>
                              {lesson.duration && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatDuration(lesson.duration)}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursePage() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <CoursePlayer />
      </ProtectedRoute>
    </AuthProvider>
  );
}