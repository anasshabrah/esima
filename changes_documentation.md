# Authentication and Email Configuration Fixes

This document outlines the changes made to fix the authentication and email sending issues in the ESIMA project.

## Summary of Issues Fixed

1. **Mismatched Authentication Tables**:
   - The signin route only checked for users in the `referralUser` table
   - The admin authorization checked for users in the `User` table
   - This mismatch prevented admin users from signing in

2. **Token Inconsistency**:
   - `AdminAuthContext` used `authToken` in localStorage
   - `AuthContext` used `token` in localStorage
   - This inconsistency caused authentication state to be lost between contexts

3. **Token Payload Mismatch**:
   - The signin route generated a token with `referralUserId`
   - The admin authorization expected a token with `userId`
   - This prevented admin validation from working correctly

4. **Missing Environment Variables**:
   - The `POSTMARK_API_KEY` environment variable was missing
   - This prevented the email service from sending password reset emails

## Changes Made

### 1. Created Unified Authentication Utilities

Created a new `auth.ts` utility file with functions to:
- Verify tokens with either `userId` or `referralUserId` in the payload
- Generate tokens with consistent payload structure

### 2. Updated AdminAuthContext

Modified `AdminAuthContext.tsx` to:
- Check for both `token` and `authToken` in localStorage
- Handle user data consistently regardless of user type

### 3. Enhanced Admin Authorization

Updated `adminAuth.ts` to:
- Check both User and referralUser tables
- Handle tokens with either userId or referralUserId
- Create compatible user objects for admin authorization

### 4. Fixed Signin Process

Updated the signin route to:
- Check both User and referralUser tables
- Generate tokens with appropriate payload structure
- Include isAdmin flag in the response

### 5. Improved User Profile Endpoint

Modified the `/api/auth/me` route to:
- Handle both types of users based on token payload
- Return appropriate user data for each user type
- Maintain security with proper data masking

### 6. Enhanced Password Reset Flow

Updated the forgot-password route to:
- Check both User and referralUser tables
- Handle password reset tokens for both user types
- Properly handle errors while maintaining security

### 7. Added Environment Variables Template

Created a `.env.example` file with:
- Required variables for authentication (JWT_SECRET)
- Required variables for email functionality (POSTMARK_API_KEY)
- Base URL and email configuration

## Implementation Details

The implementation follows these principles:
- Backward compatibility with existing code
- Graceful handling of both user types
- Consistent token structure and storage
- Proper error handling and security practices

## Next Steps

To complete the implementation:
1. Create a `.env` file based on the provided `.env.example`
2. Add your Postmark API key to enable email functionality
3. Restart the application to apply the changes
