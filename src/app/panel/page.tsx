'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalCourses: number;
  totalAnnouncements: number;
  totalUsers?: number;
  totalStudents?: number;
}

export default function PanelDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalAnnouncements: 0,
    totalUsers: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch courses
      const coursesResponse = await fetch('/api/courses', {
        credentials: 'include',
      });
      
      // Fetch announcements
      const announcementsResponse = await fetch('/api/announcements', {
        credentials: 'include',
      });

      let coursesData, announcementsData, usersData;

      if (coursesResponse.ok) {
        coursesData = await coursesResponse.json();
      }

      if (announcementsResponse.ok) {
        announcementsData = await announcementsResponse.json();
      }

      // Fetch users if admin
      if (user?.role === 'admin') {
        const usersResponse = await fetch('/api/users', {
          credentials: 'include',
        });
        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        }
      }

      setStats({
        totalCourses: coursesData?.courses?.length || 0,
        totalAnnouncements: announcementsData?.announcements?.length || 0,
        totalUsers: usersData?.users?.length || 0,
        totalStudents: usersData?.users?.filter((u: any) => u.role === 'student').length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002394]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-poppins text-3xl font-bold text-[#212121] mb-2">
          Welcome to your {user?.role === 'admin' ? 'Admin' : 'Teacher'} Panel
        </h1>
        <p className="text-gray-600">
          Manage your courses, announcements, and platform content from this dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:border-[#002394] transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#212121]">
              {stats.totalCourses}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:border-[#002394] transition-colors duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#212121]">
              {stats.totalAnnouncements}
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <>
            <Card className="border-gray-200 hover:border-[#002394] transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#212121]">
                  {stats.totalUsers}
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-[#002394] transition-colors duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#212121]">
                  {stats.totalStudents}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="font-poppins text-xl text-[#212121]">
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <a
                href="/panel/announcements"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-[#002394] hover:bg-opacity-10 transition-colors duration-200"
              >
                <div className="font-medium text-[#212121]">Create New Announcement</div>
                <div className="text-sm text-gray-600">Share important updates with students</div>
              </a>
              
              <a
                href="/panel/courses"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-[#002394] hover:bg-opacity-10 transition-colors duration-200"
              >
                <div className="font-medium text-[#212121]">
                  {user?.role === 'admin' ? 'Manage All Courses' : 'View My Courses'}
                </div>
                <div className="text-sm text-gray-600">
                  {user?.role === 'admin' ? 'Oversee all platform courses' : 'Create and edit your courses'}
                </div>
              </a>

              {user?.role === 'admin' && (
                <a
                  href="/panel/users"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-[#002394] hover:bg-opacity-10 transition-colors duration-200"
                >
                  <div className="font-medium text-[#212121]">User Management</div>
                  <div className="text-sm text-gray-600">Add, edit, or remove platform users</div>
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="font-poppins text-xl text-[#212121]">
              Platform Status
            </CardTitle>
            <CardDescription>
              Current system information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Status</span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Online
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Role</span>
                <Badge variant="outline" className="capitalize">
                  {user?.role}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Grade</span>
                <Badge variant="outline">
                  {user?.grade || 'N/A'}
                </Badge>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Last login: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}