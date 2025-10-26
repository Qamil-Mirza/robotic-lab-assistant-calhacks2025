import { NextResponse } from 'next/server';
import { mockRobotStatus, mockTasks, getLastTaskCompletionTime } from '@/lib/mock-data';

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Determine current activity based on task queue
  let currentActivity: string | null = null;

  // Find the first in-progress task
  const inProgressTask = mockTasks.find(task => task.status === 'in_progress');

  if (inProgressTask) {
    // Show the current task being executed
    currentActivity = `Moving sample ${inProgressTask.sampleId} from ${inProgressTask.source} to ${inProgressTask.destination}`;
  } else {
    // Check if a task was recently completed (within last 3 seconds)
    const lastCompletionTime = getLastTaskCompletionTime();
    const now = new Date();

    if (lastCompletionTime && (now.getTime() - lastCompletionTime.getTime() < 3000)) {
      // Task was recently completed, show completion message
      currentActivity = 'Task complete';
    } else {
      // No task in progress - show awaiting status
      currentActivity = 'Awaiting task';
    }
  }

  // Update the status with dynamic activity
  const status = {
    ...mockRobotStatus,
    currentActivity,
    lastUpdated: new Date(),
  };

  return NextResponse.json(status);
}
