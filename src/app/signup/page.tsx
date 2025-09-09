'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AVAILABLE_GRADES = [
  'Pemula (7-9 tahun)',
  'Grade 4',
  'Grade 5', 
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Dewasa',
];

function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.grade) {
      setError('Please select your grade level');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup(formData.name, formData.email, formData.password, formData.grade);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-lg border-gray-100">
        <CardHeader className="text-center">
          <CardTitle className="font-poppins text-2xl font-bold text-[#212121]">
            Join BWC Academy
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create your account to start your Roblox journey
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
              <Label htmlFor="name" className="text-sm font-medium text-[#212121]">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            
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
                placeholder="Create a password (min 6 characters)"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#212121]">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]"
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="grade" className="text-sm font-medium text-[#212121]">
                Grade/Level
              </Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => handleChange('grade', value)}
                disabled={loading}
              >
                <SelectTrigger className="mt-1 border-gray-200 focus:border-[#002394] focus:ring-[#002394]">
                  <SelectValue placeholder="Pilih tingkat usia/kelas" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#002394] hover:bg-[#001a73] text-white py-3 font-medium"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-[#002394] hover:text-[#001a73] font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation variant="public" />
        <SignUpForm />
      </div>
    </AuthProvider>
  );
}