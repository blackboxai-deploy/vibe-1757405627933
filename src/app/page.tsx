'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Abstract background animation component
function AbstractBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#008080] opacity-5 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-48 h-48 bg-[#008080] opacity-10 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-[#008080] opacity-5 rounded-full animate-pulse delay-2000"></div>
      
      {/* Geometric lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#008080" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#008080" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d="M 0,300 Q 400,100 800,300 T 1600,300" stroke="url(#lineGradient)" strokeWidth="2" fill="none" opacity="0.3">
          <animateTransform 
            attributeName="transform" 
            type="translate" 
            values="0,0;50,10;0,0" 
            dur="8s" 
            repeatCount="indefinite"
          />
        </path>
        <path d="M 200,500 Q 600,300 1000,500 T 2000,500" stroke="url(#lineGradient)" strokeWidth="1" fill="none" opacity="0.2">
          <animateTransform 
            attributeName="transform" 
            type="translate" 
            values="0,0;-30,5;0,0" 
            dur="10s" 
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
}

// Featured courses data
const featuredCourses = [
  {
    title: 'Modul 1: Pengenalan Roblox Studio',
    description: 'Mengenal antarmuka Roblox Studio dan membuat objek dasar. Proyek: Miniatur rumah.',
    targetGrades: ['Pemula', 'Grade 7', 'Grade 8'],
    sessions: '2 sesi'
  },
  {
    title: 'Modul 2: Dasar-Dasar Scripting',
    description: 'Belajar Lua programming untuk mengontrol objek dan gameplay. Proyek: Pintu otomatis.',
    targetGrades: ['Pemula', 'Grade 8', 'Grade 9'],
    sessions: '3 sesi'
  },
  {
    title: 'Modul 3: Interaktivitas & Gameplay',
    description: 'Membuat GUI, player interaction, dan multiplayer systems. Proyek: Speed Run Button.',
    targetGrades: ['Menengah', 'Grade 9', 'Grade 10'],
    sessions: '3 sesi'
  },
  {
    title: 'Modul 4: Membuat Game Mini',
    description: 'Environment design, game systems, dan publikasi. Proyek Akhir: Game Obby lengkap.',
    targetGrades: ['Menengah', 'Grade 10', 'Grade 11'],
    sessions: '4 sesi'
  },
];

// How it works steps
const steps = [
  {
    number: '1',
    title: 'Sign Up',
    description: 'Create your account and select your grade level',
  },
  {
    number: '2',
    title: 'Choose Your Class',
    description: 'Browse and enroll in courses tailored to your level',
  },
  {
    number: '3',
    title: 'Start Learning',
    description: 'Access video lessons, transcripts, and resources',
  },
];

export default function HomePage() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8F8F8]">
        <Navigation variant="public" />
        
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <AbstractBackground />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="font-poppins text-4xl lg:text-6xl font-bold text-[#212121] mb-6">
                Master Roblox Game{' '}
                <span className="text-[#002394]">Development</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Learn to create amazing games in Roblox Studio. From basic scripting with Lua to 
                advanced gameplay systems, build your skills step by step with hands-on projects.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button 
                    className="bg-[#002394] hover:bg-[#001a73] text-white px-8 py-6 text-lg rounded-lg"
                    size="lg"
                  >
                    Start Creating Games
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button 
                    variant="outline" 
                    className="border-[#002394] text-[#002394] hover:bg-[#002394] hover:text-white px-8 py-6 text-lg rounded-lg"
                    size="lg"
                  >
                    View Curriculum
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Course Highlights Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-poppins text-3xl lg:text-4xl font-bold text-[#212121] mb-4">
                Featured Courses
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our most popular courses designed for different learning levels
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredCourses.map((course, index) => (
                <Card key={index} className="border-gray-100 hover:border-[#002394] transition-colors duration-300 shadow-sm hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="font-poppins text-[#212121] text-lg">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      {course.sessions} • {course.targetGrades.join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {course.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[#F8F8F8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-poppins text-3xl lg:text-4xl font-bold text-[#212121] mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Getting started is simple and intuitive
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-[#002394] text-white rounded-full font-poppins font-bold text-xl mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-poppins text-xl font-semibold text-[#212121] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="font-poppins text-xl font-bold text-[#212121] mb-4">
                BWC Academy
              </div>
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <Link href="/about" className="hover:text-[#002394] transition-colors">
                  About
                </Link>
                <Link href="/privacy" className="hover:text-[#002394] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/contact" className="hover:text-[#002394] transition-colors">
                  Contact
                </Link>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                © 2024 BWC Academy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}