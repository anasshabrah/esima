import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '@/utils/adminAuth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Fetch settings
    const settings = await prisma.setting.findMany();

    // Convert array to object with key-value pairs
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ settings: settingsObject });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.isAuthenticated || !authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    // Update settings
    const updatedSettings = [];
    for (const [key, value] of Object.entries(settings)) {
      // Check if setting exists
      const existingSetting = await prisma.setting.findUnique({
        where: { key },
      });

      if (existingSetting) {
        // Update existing setting
        const updated = await prisma.setting.update({
          where: { key },
          data: { value: String(value) },
        });
        updatedSettings.push(updated);
      } else {
        // Create new setting
        const created = await prisma.setting.create({
          data: {
            key,
            value: String(value),
          },
        });
        updatedSettings.push(created);
      }
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authResult.user?.id,
        action: 'UPDATE',
        resourceType: 'SETTINGS',
        resourceId: 'global',
        details: `Admin updated system settings: ${Object.keys(settings).join(', ')}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ 
      success: true,
      settings: updatedSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>)
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
