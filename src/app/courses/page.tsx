'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Course {
  _id: string;
  title: string;
  description: string;
  targetGrades: string[];
  lessons: any[];
  createdBy: {
    name: string;
    email: string;
  };
  enrolledStudents: string[];
  createdAt: string;
}

function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.error || 'Failed to load courses');
      }
    } catch (err) {
      setError('Failed to load courses');
      console.error('Fetch courses error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.targetGrades.some(grade => 
      grade.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#008080]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation variant="public" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-poppins text-4xl font-bold text-[#212121] mb-4">
            Kurikulum Roblox Studio
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Program lengkap untuk menguasai game development di Roblox Studio, dari dasar hingga mahir membuat game.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
          />
        </div>

        {/* Error Message */}
        {error && (
          <Alert className="mb-8 max-w-2xl mx-auto border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'No courses found' : 'No courses available'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Courses will appear here once they are created'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card 
                key={course._id} 
                className="border-gray-100 hover:border-[#002394] transition-all duration-300 shadow-sm hover:shadow-lg group"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="font-poppins text-xl text-[#212121] group-hover:text-[#002394] transition-colors">
                      {course.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {course.lessons?.length || 0} lessons
                    </Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-500">
                    by {course.createdBy?.name || 'Unknown'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {course.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.targetGrades?.slice(0, 3).map((grade) => (
                      <Badge key={grade} variant="outline" className="text-xs">
                        {grade}
                      </Badge>
                    ))}
                    {course.targetGrades?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{course.targetGrades.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {course.enrolledStudents?.length || 0} enrolled
                    </span>
                    <Link href={`/courses/${course._id}`}>
                      <Button 
                        size="sm"
                        className="bg-[#002394] hover:bg-[#001a73] text-white"
                      >
                        Lihat Modul
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-lg p-8 shadow-sm">
          <h2 className="font-poppins text-2xl font-bold text-[#212121] mb-4">
            Siap Membuat Game Pertama?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Bergabung dengan ribuan siswa yang telah berhasil membuat game amazing di Roblox Studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button 
                className="bg-[#002394] hover:bg-[#001a73] text-white px-8 py-3"
                size="lg"
              >
                Mulai Belajar
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                variant="outline"
                className="border-[#002394] text-[#002394] hover:bg-[#002394] hover:text-white px-8 py-3"
                size="lg"
              >
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <AuthProvider>
      <CoursesList />
    </AuthProvider>
  );
}