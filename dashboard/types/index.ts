export type ProtocolPhase =
  | 'PCR'
  | 'Gel'
  | 'Zymo'
  | 'Assembly'
  | 'Transformation'
  | 'Picking'
  | 'Miniprep'
  | 'Sequence';

export const PROTOCOL_PHASES: ProtocolPhase[] = [
  'PCR',
  'Gel',
  'Zymo',
  'Assembly',
  'Transformation',
  'Picking',
  'Miniprep',
  'Sequence',
];

export interface Sample {
  id: string;
  storageLocation: string;
  currentPhase: ProtocolPhase;
  completedPhases: ProtocolPhase[];
  lastUpdated: Date;
  status: 'active' | 'completed' | 'failed';
}

export type TaskType = 'move';

export type TaskStatus = 'queued' | 'in_progress' | 'completed' | 'failed';

export type TaskPriority = 'urgent' | 'normal' | 'low';

export interface Task {
  id: string;
  sampleId: string;
  type: TaskType;
  source: string;
  destination: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedDuration: number; // seconds
  createdAt: Date;
  startedAt?: Date; // when task started (in_progress)
  completedAt?: Date; // when task finished (completed/failed)
}

export type RobotConnectionStatus = 'connected' | 'disconnected';

export interface RobotStatus {
  connectionStatus: RobotConnectionStatus;
  currentActivity: string | null;
  lastUpdated: Date;
}

export interface CreateTaskInput {
  sampleId: string;
  source: string;
  destination: string;
  priority: TaskPriority;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  priority?: TaskPriority;
}
