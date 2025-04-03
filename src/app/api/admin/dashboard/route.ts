'use client';

import React, { useState, useEffect } from 'react';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuthToken } from '@/utils/auth';

// Helper function to verify admin access
async function verifyAdminAccess(request) {
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

// GET handler for dashboard data
export async function GET(request) {
  const { isAuthorized, user, error } = await verifyAdminAccess(request);
  
  if (!isAuthorized) {
    return NextResponse.json({ error }, { status: 401 });
  }
  
  try {
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = (currentMonth - 1 + 12) % 12;
    const currentYear = now.getFullYear();
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Start of current and previous months
    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPreviousMonth = new Date(previousYear, previousMonth, 1);
    
    // Get total users
    const totalUsers = await prisma.user.count();
    
    // Get users created in current and previous months
    const usersCurrentMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfCurrentMonth
        }
      }
    });
    
    const usersPreviousMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth
        }
      }
    });
    
    // Calculate user growth percentage
    const usersChange = usersPreviousMonth > 0 
      ? Math.round(((usersCurrentMonth - usersPreviousMonth) / usersPreviousMonth) * 100) 
      : 0;
    
    // Get total orders
    const totalOrders = await prisma.order.count();
    
    // Get orders created in current and previous months
    const ordersCurrentMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfCurrentMonth
        }
      }
    });
    
    const ordersPreviousMonth = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth
        }
      }
    });
    
    // Calculate order growth percentage
    const ordersChange = ordersPreviousMonth > 0 
      ? Math.round(((ordersCurrentMonth - ordersPreviousMonth) / ordersPreviousMonth) * 100) 
      : 0;
    
    // Get total revenue
    const totalRevenueResult = await prisma.order.aggregate({
      _sum: {
        amount: true
      }
    });
    
    const totalRevenue = totalRevenueResult._sum.amount || 0;
    
    // Get revenue for current and previous months
    const revenueCurrentMonth = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfCurrentMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    const revenuePreviousMonth = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfPreviousMonth,
          lt: startOfCurrentMonth
        }
      },
      _sum: {
        amount: true
      }
    });
    
    // Calculate revenue growth percentage
    const currentMonthRevenue = revenueCurrentMonth._sum.amount || 0;
    const previousMonthRevenue = revenuePreviousMonth._sum.amount || 0;
    
    const revenueChange = previousMonthRevenue > 0 
      ? Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100) 
      : 0;
    
    // Get active eSIMs count
    const activeEsims = await prisma.esim.count({
      where: {
        status: 'ACTIVE'
      }
    });
    
    // Get pending withdrawals count
    const pendingWithdrawals = await prisma.withdrawal.count({
      where: {
        status: 'PENDING'
      }
    });
    
    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        userId: user.id,
        action: 'view',
        entityType: 'dashboard',
        details: JSON.stringify({ timestamp: new Date() }),
        ipAddress: request.headers.get('x-forwarded-for') || request.ip,
        userAgent: request.headers.get('user-agent'),
      },
    });
    
    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      activeEsims,
      pendingWithdrawals,
      usersChange,
      ordersChange,
      revenueChange
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
