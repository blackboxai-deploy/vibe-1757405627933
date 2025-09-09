'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Course {
  _id: string;
  title: string;
  description: string;
  lessons: any[];
  createdBy: {
    name: string;
  };
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  link?: string;
  author: {
    name: string;
    role: string;
  };
  createdAt: string;
}

function StudentDashboard() {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch enrolled courses
      const coursesResponse = await fetch('/api/courses', {
        credentials: 'include',
      });
      
      // Fetch announcements
      const announcementsResponse = await fetch('/api/announcements', {
        credentials: 'include',
      });

      const coursesData = await coursesResponse.json();
      const announcementsData = await announcementsResponse.json();

      if (coursesResponse.ok) {
        // Filter courses that user is enrolled in
        const enrolled = coursesData.courses?.filter((course: Course) => 
          user?.enrolledCourses?.includes(course._id)
        ) || [];
        setEnrolledCourses(enrolled);
      }

      if (announcementsResponse.ok) {
        setAnnouncements(announcementsData.announcements || []);
      }

      if (!coursesResponse.ok || !announcementsResponse.ok) {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002394]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation variant="authenticated" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-poppins text-3xl font-bold text-[#212121] mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey with {enrolledCourses.length} enrolled courses
          </p>
        </div>

        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-poppins text-2xl font-bold text-[#212121]">
                My Courses
              </h2>
              <Link href="/courses">
                <Button variant="outline" className="border-[#002394] text-[#002394] hover:bg-[#002394] hover:text-white">
                  Browse More Courses
                </Button>
              </Link>
            </div>

            {enrolledCourses.length === 0 ? (
              <Card className="border-gray-100">
                <CardContent className="py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="font-poppins text-lg font-medium text-gray-600 mb-2">
                    No courses enrolled yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start your learning journey by enrolling in courses
                  </p>
                  <Link href="/courses">
                    <Button className="bg-[#002394] hover:bg-[#001a73] text-white">
                      Explore Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map((course) => (
                  <Card key={course._id} className="border-gray-100 hover:border-[#002394] transition-colors duration-300 shadow-sm hover:shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-poppins text-xl text-[#212121] mb-2">
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            by {course.createdBy?.name}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {course.lessons?.length || 0} lessons
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          Progress: 0% complete
                        </div>
                        <Link href={`/courses/${course._id}`}>
                          <Button 
                            size="sm"
                            className="bg-[#002394] hover:bg-[#001a73] text-white"
                          >
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Section */}
          <div>
            <h2 className="font-poppins text-2xl font-bold text-[#212121] mb-6">
              Announcements
            </h2>

            {announcements.length === 0 ? (
              <Card className="border-gray-100">
                <CardContent className="py-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-600 mb-2">
                    No announcements
                  </h3>
                  <p className="text-sm text-gray-500">
                    New announcements will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcements.slice(0, 5).map((announcement) => (
                  <Card key={announcement._id} className="border-gray-100 hover:border-[#002394] transition-colors duration-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-poppins text-base text-[#212121]">
                        {announcement.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {announcement.author.name} • {formatDate(announcement.createdAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {announcement.content}
                      </p>
                      {announcement.link && (
                        <a 
                          href={announcement.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#002394] hover:text-[#001a73] underline"
                        >
                          View Link
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {announcements.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      View All Announcements
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    </AuthProvider>
  );
}