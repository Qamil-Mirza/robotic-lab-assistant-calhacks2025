import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/lib/mock-data';
import { UpdateTaskInput } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateTaskInput = await request.json();

    const updatedTask = updateTask(id, body);

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const success = deleteTask(id);

  if (!success) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json({ success: true });
}
