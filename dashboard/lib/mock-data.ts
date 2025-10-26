import { Sample, Task, RobotStatus, ProtocolPhase } from '@/types';

// Mock samples data
export const mockSamples: Sample[] = [
  {
    id: 'PCR-2025-001',
    storageLocation: 'Freezer A3',
    currentPhase: 'Assembly',
    completedPhases: ['PCR', 'Gel', 'Zymo'],
    lastUpdated: new Date('2025-10-25T10:30:00'),
    status: 'active',
  },
  {
    id: 'PCR-2025-002',
    storageLocation: 'Bench B',
    currentPhase: 'Gel',
    completedPhases: ['PCR'],
    lastUpdated: new Date('2025-10-25T09:15:00'),
    status: 'active',
  },
  {
    id: 'PCR-2025-003',
    storageLocation: 'Freezer B1',
    currentPhase: 'Miniprep',
    completedPhases: ['PCR', 'Gel', 'Zymo', 'Assembly', 'Transformation', 'Picking'],
    lastUpdated: new Date('2025-10-25T08:45:00'),
    status: 'active',
  },
  {
    id: 'PCR-2025-004',
    storageLocation: 'Bench A',
    currentPhase: 'PCR',
    completedPhases: [],
    lastUpdated: new Date('2025-10-25T11:00:00'),
    status: 'active',
  },
  {
    id: 'PCR-2025-005',
    storageLocation: 'Freezer A2',
    currentPhase: 'Transformation',
    completedPhases: ['PCR', 'Gel', 'Zymo', 'Assembly'],
    lastUpdated: new Date('2025-10-24T16:20:00'),
    status: 'active',
  },
  {
    id: 'PCR-2025-006',
    storageLocation: 'Bench C',
    currentPhase: 'Sequence',
    completedPhases: ['PCR', 'Gel', 'Zymo', 'Assembly', 'Transformation', 'Picking', 'Miniprep'],
    lastUpdated: new Date('2025-10-25T07:30:00'),
    status: 'completed',
  },
];

// Mock tasks data
let taskCounter = 1;
export const mockTasks: Task[] = [];

export function createTask(
  sampleId: string,
  source: string,
  destination: string,
  priority: 'urgent' | 'normal' | 'low'
): Task {
  const task: Task = {
    id: `TASK-${String(taskCounter++).padStart(3, '0')}`,
    sampleId,
    type: 'move',
    source,
    destination,
    status: 'queued',
    priority,
    estimatedDuration: 120 + Math.floor(Math.random() * 120),
    createdAt: new Date(),
  };
  mockTasks.push(task);
  return task;
}

export function updateTask(
  taskId: string,
  updates: Partial<Task>
): Task | undefined {
  const index = mockTasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    const currentTask = mockTasks[index];
    const updatedTask = { ...currentTask, ...updates };

    // Automatically set timestamps based on status changes
    if (updates.status === 'in_progress' && !updatedTask.startedAt) {
      updatedTask.startedAt = new Date();
    }
    if ((updates.status === 'completed' || updates.status === 'failed') && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date();
      // Track completion time for "Task complete" message
      setLastTaskCompletionTime(updatedTask.completedAt);
    }

    mockTasks[index] = updatedTask;
    return mockTasks[index];
  }
  return undefined;
}

export function deleteTask(taskId: string): boolean {
  const index = mockTasks.findIndex((t) => t.id === taskId);
  if (index !== -1) {
    mockTasks.splice(index, 1);
    return true;
  }
  return false;
}

// Mock robot status
export const mockRobotStatus: RobotStatus = {
  connectionStatus: 'connected',
  currentActivity: 'Moving sample PCR-2025-001 from Bench A to Bench B',
  lastUpdated: new Date(),
};

// Track last task completion time for "Task complete" message
let lastTaskCompletionTime: Date | null = null;

export function setLastTaskCompletionTime(time: Date | null) {
  lastTaskCompletionTime = time;
}

export function getLastTaskCompletionTime(): Date | null {
  return lastTaskCompletionTime;
}

// Storage locations for dropdowns
export const storageLocations = [
  'Bench A',
  'Bench B',
  'Bench C',
  'Freezer A1',
  'Freezer A2',
  'Freezer A3',
  'Freezer B1',
  'Freezer B2',
  'Incubator 1',
  'Incubator 2',
];
