import { NextResponse } from 'next/server';
import { mockTasks, createTask } from '@/lib/mock-data';
import { CreateTaskInput } from '@/types';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockTasks);
}

export async function POST(request: Request) {
  try {
    const body: CreateTaskInput = await request.json();

    // Validate required fields
    if (!body.sampleId || !body.source || !body.destination || !body.priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new task
    const newTask = createTask(
      body.sampleId,
      body.source,
      body.destination,
      body.priority
    );

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
