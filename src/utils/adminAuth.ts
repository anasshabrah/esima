// src/utils/adminAuth.ts

import { verifyAuthToken } from '@/utils/auth';
import { prisma } from '@/lib/prisma';

// Helper function to verify admin access
export async function verifyAdminAccess(request: Request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthorized: false, error: 'Unauthorized: No token provided' };
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token and get the payload
    const payload = verifyAuthToken(token);

    if (!payload || !payload.userId) {
      return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
    }

    // Get the user from the database using the provided userId
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) },
    });

    if (!user) {
      return { isAuthorized: false, error: 'Unauthorized: User not found' };
    }

    // Check if the user has admin privileges
    if (!user.isAdmin) {
      return { isAuthorized: false, error: 'Forbidden: Admin access required' };
    }

    return { isAuthorized: true, user };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
  }
}
