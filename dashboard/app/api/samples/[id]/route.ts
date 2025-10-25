import { NextResponse } from 'next/server';
import { mockSamples } from '@/lib/mock-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const sample = mockSamples.find((s) => s.id === id);

  if (!sample) {
    return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
  }

  return NextResponse.json(sample);
}
