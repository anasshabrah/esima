// src/app/api/admin/auth/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/utils/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const { isAuthorized, admin, error } = await verifyAdminAccess(request);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return the admin data
    return NextResponse.json(admin, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
