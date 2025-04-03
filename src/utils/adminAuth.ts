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

    if (!payload) {
      return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
    }

    // Check for either userId or referralUserId in the payload
    const userId = payload.userId || payload.referralUserId;
    
    if (!userId) {
      return { isAuthorized: false, error: 'Unauthorized: Invalid token payload' };
    }

    // First try to find the user in the User table
    let user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    // If not found in User table, try the referralUser table
    if (!user) {
      const referralUser = await prisma.referralUser.findUnique({
        where: { id: Number(userId) },
      });

      // If found in referralUser table and has admin privileges, create a compatible user object
      if (referralUser && referralUser.isAdmin) {
        user = {
          id: referralUser.id,
          email: referralUser.email,
          name: referralUser.name,
          isAdmin: referralUser.isAdmin,
          // Add any other required fields
        };
      }
    }

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
