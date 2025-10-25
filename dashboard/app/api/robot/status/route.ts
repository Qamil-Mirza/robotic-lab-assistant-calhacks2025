import { NextResponse } from 'next/server';
import { mockRobotStatus } from '@/lib/mock-data';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Update the lastUpdated timestamp
  const status = {
    ...mockRobotStatus,
    lastUpdated: new Date(),
  };

  return NextResponse.json(status);
}
