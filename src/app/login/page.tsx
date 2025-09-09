'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      
      // Redirect based on role will be handled by auth context
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="font-poppins text-2xl font-bold text-[#212121]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your BWC Academy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[#212121]">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-[#212121]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#002394] hover:bg-[#001a73] text-white py-3 font-medium"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#002394] hover:text-[#001a73] font-medium">
                Create one
              </Link>
            </p>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Demo accounts for testing:</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Student: student@bwc.com / password123</div>
                <div>Teacher: teacher@bwc.com / password123</div>
                <div>Admin: admin@bwc.com / password123</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation variant="public" />
        <LoginForm />
      </div>
    </AuthProvider>
  );
}