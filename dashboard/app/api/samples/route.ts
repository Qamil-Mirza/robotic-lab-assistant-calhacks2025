import { NextResponse } from 'next/server';
import { mockSamples } from '@/lib/mock-data';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockSamples);
}
