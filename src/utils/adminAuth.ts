// src/utils/adminAuth.ts

import { verifyAuthToken } from '@/utils/auth';
import { prisma } from '@/lib/prisma';

export async function verifyAdminAccess(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthorized: false, error: 'Unauthorized: No token provided' };
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAuthToken(token);
    // Check for adminId since admin tokens include that.
    if (!payload || !payload.adminId) {
      return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
    }

    // Fetch admin from the Admin table
    const admin = await prisma.admin.findUnique({
      where: { id: Number(payload.adminId) },
    });
    if (!admin) {
      return { isAuthorized: false, error: 'Unauthorized: Admin not found' };
    }
    return { isAuthorized: true, admin };
  } catch (error) {
    console.error('Error verifying admin authentication:', error);
    return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
  }
}
