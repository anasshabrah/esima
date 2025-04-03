// src/app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Import your session or token handling here

export async function POST(request: NextRequest) {
  try {
    // Clear the session or token here

    return NextResponse.json({ message: 'Logged out successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
