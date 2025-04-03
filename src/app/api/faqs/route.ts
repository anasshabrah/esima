// src/app/api/faqs/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryIso = searchParams.get('countryIso');

  if (!countryIso) {
    return NextResponse.json(
      { error: 'countryIso parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const faqs = await prisma.faq.findMany({
      where: { countryIso },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs.' },
      { status: 500 }
    );
  }
}
