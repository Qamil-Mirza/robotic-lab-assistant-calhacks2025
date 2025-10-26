import { NextResponse } from 'next/server';
import { mockTasks, updateTask } from '@/lib/mock-data';

const ROBOT_SERVER_URL = process.env.ROBOT_SERVER_URL || 'http://localhost:8000';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the task
    const task = mockTasks.find((t) => t.id === id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status to in_progress
    updateTask(id, { status: 'in_progress' });

    try {
      // Call the robot server's walk-straight API
      const response = await fetch(`${ROBOT_SERVER_URL}/api/robot/walk-straight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance: 1.0, // 1 meter forward
          speed: 0.3,    // moderate speed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Robot command failed');
      }

      const robotResponse = await response.json();

      // Update task status to completed
      const completedTask = updateTask(id, { status: 'completed' });

      return NextResponse.json({
        task: completedTask,
        robotResponse,
      });
    } catch (error) {
      // Update task status to failed
      const failedTask = updateTask(id, { status: 'failed' });

      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : 'Failed to execute robot command',
          task: failedTask,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
