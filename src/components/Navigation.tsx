'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  variant?: 'public' | 'authenticated';
}

export default function Navigation({ variant = 'public' }: NavigationProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (variant === 'public' || !user) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-poppins text-xl font-bold text-[#212121]">
                BWC Academy
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link 
                  href="/courses" 
                  className="text-[#212121] hover:text-[#002394] transition-colors duration-200"
                >
                  Curriculum
                </Link>
                <Link 
                  href="/about" 
                  className="text-[#212121] hover:text-[#002394] transition-colors duration-200"
                >
                  About
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name}
                  </span>
                  {user.role === 'student' && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {(user.role === 'teacher' || user.role === 'admin') && (
                    <Link href="/panel">
                      <Button variant="outline" size="sm">
                        Panel
                      </Button>
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      className="bg-[#002394] hover:bg-[#001a73] text-white"
                      size="sm"
                    >
                      Join Academy
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated navigation for dashboard/panel
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-poppins text-xl font-bold text-[#212121]">
            Abstract Learning
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user.name} ({user.role})
            </span>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}