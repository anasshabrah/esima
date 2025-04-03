# AloData Admin Panel - Installation Guide for Custom Project Structure

This guide provides detailed instructions for installing the admin panel in your specific AloData project structure, which uses a custom authentication system and internationalization approach.

## Prerequisites

- Existing AloData Next.js project with the structure you've shared
- Custom JWT-based authentication system already set up
- Prisma ORM configured with a database

## Installation Steps

### 1. Update Prisma Schema

Add the admin role and audit log models to your User model by updating your `prisma/schema.prisma` file:

```prisma
// Add these fields to your User model
model User {
  // ... existing fields
  
  // Add these new fields
  isAdmin        Boolean       @default(false)
  role           String        @default("user") // "user" or "admin"
  
  // ... rest of your model
}

// Add this model for audit logging
model AdminAuditLog {
  id          Int       @id @default(autoincrement())
  userId      Int?
  user        User?     @relation(fields: [userId], references: [id])
  action      String    // "create", "update", "delete", "login", etc.
  entityType  String    // "user", "order", "bundle", etc.
  entityId    String?   // ID of the affected entity
  details     String?   // JSON string with details of the action
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())

  @@index([userId])
  @@index([action])
  @@index([entityType])
  @@index([createdAt])
}

// Add this model for system settings
model SystemSettings {
  id                      Int       @id @default(autoincrement())
  siteName                String
  siteDescription         String?
  contactEmail            String
  supportEmail            String
  defaultCurrency         String    @default("USD")
  referralCommissionPercent Float   @default(10)
  maintenanceMode         Boolean   @default(false)
  termsUrl                String?
  privacyUrl              String?
  updatedAt               DateTime  @updatedAt
  updatedById             Int?
  updatedBy               User?     @relation(fields: [updatedById], references: [id])

  @@index([updatedById])
}

// Add this model for payment settings
model PaymentSettings {
  id                      Int       @id @default(autoincrement())
  minimumWithdrawalAmount Float     @default(50)
  updatedAt               DateTime  @updatedAt
  updatedById             Int?
  updatedBy               User?     @relation(fields: [updatedById], references: [id])
  paymentMethods          PaymentMethod[]

  @@index([updatedById])
}

model PaymentMethod {
  id                      Int       @id @default(autoincrement())
  name                    String
  isEnabled               Boolean   @default(true)
  processingFee           Float     @default(0)
  instructions            String?
  paymentSettingsId       Int
  paymentSettings         PaymentSettings @relation(fields: [paymentSettingsId], references: [id], onDelete: Cascade)

  @@index([paymentSettingsId])
}
```

Run the Prisma migration:

```bash
npx prisma migrate dev --name add-admin-role-and-audit-logs
```

### 2. Add Admin Authentication Utility

Create a new file at `src/utils/adminAuth.ts`:

```typescript
import { verifyAuthToken } from '@/utils/auth';
import { prisma } from '@/lib/prisma';

// Helper function to verify admin access
export async function verifyAdminAccess(request) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthorized: false, error: 'Unauthorized: No token provided' };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token and get the user
    const payload = verifyAuthToken(token);
    
    if (!payload || !payload.userId) {
      return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
    }
    
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.userId) }
    });
    
    if (!user) {
      return { isAuthorized: false, error: 'Unauthorized: User not found' };
    }
    
    // Check if the user is an admin
    if (!user.isAdmin) {
      return { isAuthorized: false, error: 'Forbidden: Admin access required' };
    }
    
    return { isAuthorized: true, user };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return { isAuthorized: false, error: 'Unauthorized: Invalid token' };
  }
}
```

### 3. Add Middleware for Route Protection

Create or update your `middleware.ts` file in the project root:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Middleware to protect admin routes
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is an admin route
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, redirect to login
      return NextResponse.redirect(new URL('/signin?callbackUrl=' + encodeURIComponent(path), request.url));
    }
    
    // Token is present, but we'll verify it in the API routes
    // This middleware just ensures the token exists
  }
  
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

### 4. Add Admin Authentication Context

Create a new file at `src/context/AdminAuthContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  user: any | null;
  checkAdminStatus: () => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  user: null,
  checkAdminStatus: async () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      // Call the /api/auth/me endpoint with the token
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      const userData = await response.json();
      
      // Check if user has admin role
      if (userData.user && userData.user.isAdmin) {
        setIsAdmin(true);
        setUser(userData.user);
        setIsLoading(false);
        return true;
      } else {
        setIsAdmin(false);
        setUser(userData.user);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAdmin(false);
    setUser(null);
    window.location.href = '/signin';
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, user, checkAdminStatus, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
```

### 5. Add Admin Components

Create the following directory structure for admin components:

```
src/
  components/
    admin/
      AdminSidebar.tsx
      AdminHeader.tsx
      AdminAuthGuard.tsx
      dashboard/
        KPICard.tsx
        FinancialChart.tsx
        SystemHealthMonitor.tsx
```

Copy the provided component files to these locations.

### 6. Add Admin Pages

Create the following directory structure for admin pages:

```
src/
  app/
    admin/
      layout.tsx
      page.tsx
      users/
        page.tsx
      orders/
        page.tsx
        [id]/
          page.tsx
      bundles/
        page.tsx
        [id]/
          page.tsx
      countries/
        page.tsx
        [id]/
          page.tsx
      coupons/
        page.tsx
      esims/
        page.tsx
        [id]/
          page.tsx
      withdrawals/
        page.tsx
        [id]/
          page.tsx
      settings/
        page.tsx
        payments/
          page.tsx
      audit-logs/
        page.tsx
```

Copy the provided page files to these locations.

### 7. Add Admin API Routes

Create the following directory structure for admin API routes:

```
src/
  app/
    api/
      admin/
        dashboard/
          route.ts
        users/
          route.ts
          [id]/
            route.ts
        promote-user/
          route.ts
        orders/
          route.ts
          [id]/
            route.ts
        bundles/
          route.ts
          [id]/
            route.ts
        countries/
          route.ts
          [id]/
            route.ts
        coupons/
          route.ts
          [id]/
            route.ts
        esims/
          route.ts
          [id]/
            route.ts
        withdrawals/
          route.ts
          [id]/
            route.ts
        settings/
          route.ts
        audit-logs/
          route.ts
```

Copy the provided API route files to these locations.

### 8. Update Your Package Dependencies

Make sure you have all required dependencies:

```bash
npm install react-chartjs-2 chart.js react-circular-progressbar lucide-react
```

### 9. Modify Your /api/auth/me Route

Update your existing `/api/auth/me` route to include the `isAdmin` and `role` fields in the user response:

```typescript
// In your existing src/app/api/auth/me/route.ts file
// Add the isAdmin and role fields to the user response

export async function GET(request) {
  // Your existing code to verify the token and get the user
  
  // When returning the user, include the isAdmin and role fields
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      // Add these fields
      isAdmin: user.isAdmin || false,
      role: user.role || 'user',
      // Other existing fields
    }
  });
}
```

### 10. Promote Your First Admin User

To promote your first admin user, you need to:

1. Login to your application with the user you want to promote
2. Use one of the following methods:

#### Method A: Using the Database Directly

Run a direct database query to set the first admin:

```sql
-- For PostgreSQL
UPDATE "User" SET "isAdmin" = true, "role" = 'admin' WHERE "email" = 'your-email@example.com';

-- For MySQL
UPDATE User SET isAdmin = true, role = 'admin' WHERE email = 'your-email@example.com';

-- For SQLite
UPDATE User SET isAdmin = 1, role = 'admin' WHERE email = 'your-email@example.com';
```

#### Method B: Using the API

Once you've deployed the admin API routes, you can use the promote-user endpoint:

```bash
curl -X POST http://localhost:3000/api/admin/promote-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"email": "your-email@example.com"}'
```

Note: For this to work, you'll need to temporarily modify the `verifyAdminAccess` function in the `promote-user` route to allow the first promotion without admin check.

### 11. Verify Installation

1. Restart your Next.js development server
2. Login with your admin user
3. Navigate to `/admin`
4. You should see the admin dashboard

## Internationalization Considerations

Since your project uses a custom internationalization approach with `[lang]` route parameters, you may want to add language support to the admin panel as well. Here are some options:

1. **Separate Admin Panel**: Keep the admin panel separate from your internationalized routes (current implementation)
2. **Add Language Support**: Create language-specific admin routes at `/[lang]/admin/*`

If you choose option 2, you'll need to:

1. Move the admin pages from `/src/app/admin/*` to `/src/app/[lang]/admin/*`
2. Update the middleware to handle the new route pattern
3. Modify the AdminAuthContext to handle language changes

## Troubleshooting

### Access Denied to Admin Panel

If you're getting redirected or access denied:

1. Check that your user has the `isAdmin` field set to `true` in the database
2. Verify the JWT token is being sent correctly in the Authorization header
3. Check that your `/api/auth/me` endpoint is returning the `isAdmin` field
4. Verify the middleware is correctly configured

### API Routes Not Working

If API routes return 404 or 401:

1. Ensure the API routes are in the correct location
2. Check that your JWT token is valid and not expired
3. Verify the `verifyAdminAccess` function is working correctly

### Database Migration Issues

If you encounter issues with the Prisma migration:

1. Try running `npx prisma db push` instead
2. Check your database connection
3. Ensure you have the correct permissions

## Next Steps

After installation, consider:

1. Customizing the admin panel to match your brand
2. Adding additional modules specific to your application needs
3. Setting up proper error logging and monitoring
4. Implementing more advanced security measures
