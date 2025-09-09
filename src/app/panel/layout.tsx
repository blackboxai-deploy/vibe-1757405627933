'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SidebarNavItem {
  title: string;
  href: string;
  roles: string[];
}

const navigationItems: SidebarNavItem[] = [
  {
    title: 'Dashboard',
    href: '/panel',
    roles: ['teacher', 'admin'],
  },
  {
    title: 'Announcements',
    href: '/panel/announcements',
    roles: ['teacher', 'admin'],
  },
  {
    title: 'My Courses',
    href: '/panel/my-courses',
    roles: ['teacher', 'admin'],
  },
  {
    title: 'Course Management',
    href: '/panel/courses',
    roles: ['admin'],
  },
  {
    title: 'User Management',
    href: '/panel/users',
    roles: ['admin'],
  },
];

function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const filteredItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <Card className="h-full border-gray-200 shadow-sm">
      <div className="p-6">
        <h2 className="font-poppins text-lg font-bold text-[#212121] mb-6">
          {user?.role === 'admin' ? 'BWC Admin Panel' : 'BWC Instructor Panel'}
        </h2>
        
        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={`w-full justify-start ${
                  pathname === item.href 
                    ? 'bg-[#002394] hover:bg-[#001a73] text-white'
                    : 'text-gray-700 hover:text-[#002394] hover:bg-gray-50'
                }`}
              >
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs capitalize">{user?.role}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Navigation variant="authenticated" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <Sidebar />
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRoute allowedRoles={['teacher', 'admin']}>
        <PanelLayout>
          {children}
        </PanelLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}