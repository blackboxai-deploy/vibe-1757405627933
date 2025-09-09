import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is not allowed in production' },
        { status: 403 }
      );
    }

    await seedDatabase();
    
    return NextResponse.json(
      { 
        message: 'BWC Academy database seeded successfully',
        accounts: [
          { email: 'admin@bwc.com', password: 'password123', role: 'admin' },
          { email: 'teacher@bwc.com', password: 'password123', role: 'teacher' },
          { email: 'student@bwc.com', password: 'password123', role: 'student' },
        ]
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Database seeding error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database: ' + error.message },
      { status: 500 }
    );
  }
}