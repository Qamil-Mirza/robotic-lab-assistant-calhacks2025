'use client';

import { useState, useEffect } from 'react';
import { Task, Sample, TaskPriority, CreateTaskInput } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Clock, Plus, X, AlertCircle, Play } from 'lucide-react';
import { format } from 'date-fns';
import { storageLocations } from '@/lib/mock-data';

interface TaskTimerProps {
  task: Task;
}

function TaskTimer({ task }: TaskTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Calculate initial elapsed time
    const calculateElapsed = () => {
      if (task.status === 'in_progress' && task.startedAt) {
        return Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000);
      } else if ((task.status === 'completed' || task.status === 'failed') && task.startedAt && task.completedAt) {
        return Math.floor((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000);
      }
      return 0;
    };

    setElapsedSeconds(calculateElapsed());

    // Only set up interval for in_progress tasks
    if (task.status === 'in_progress' && task.startedAt) {
      const interval = setInterval(() => {
        setElapsedSeconds(calculateElapsed());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [task.status, task.startedAt, task.completedAt]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // For queued tasks, show estimated duration with "Est:" prefix
  if (task.status === 'queued') {
    return (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>Est: {formatDuration(task.estimatedDuration)}</span>
      </div>
    );
  }

  // For in_progress, completed, or failed tasks, show elapsed time
  return (
    <div className="flex items-center gap-1">
      <Clock className="h-3 w-3" />
      <span>{formatDuration(elapsedSeconds)}</span>
    </div>
  );
}

interface TaskQueueProps {
  tasks: Task[];
  samples: Sample[];
  onCreateTask: (taskInput: CreateTaskInput) => Promise<void>;
  onCancelTask: (taskId: string) => Promise<void>;
  onExecuteTask: (taskId: string) => Promise<void>;
}

export function TaskQueue({
  tasks,
  samples,
  onCreateTask,
  onCancelTask,
  onExecuteTask,
}: TaskQueueProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSampleSelect = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    // Find the selected sample and set source to its current location
    const sample = samples.find((s) => s.id === sampleId);
    if (sample) {
      setSource(sample.storageLocation);
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-500';
      case 'queued':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
    }
  };

  const handleSubmit = async () => {
    if (!selectedSampleId || !source || !destination) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateTask({
        sampleId: selectedSampleId,
        source,
        destination,
        priority,
      });

      // Reset form
      setSelectedSampleId('');
      setSource('');
      setDestination('');
      setPriority('normal');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Task Queue</CardTitle>
            <CardDescription>
              {tasks.filter((t) => t.status !== 'completed').length} active tasks
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new movement task to the robot queue
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample</label>
                  <Select value={selectedSampleId} onValueChange={handleSampleSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a sample" />
                    </SelectTrigger>
                    <SelectContent>
                      {samples.map((sample) => (
                        <SelectItem key={sample.id} value={sample.id}>
                          {sample.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Location</label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Location</label>
                  <Select value={destination} onValueChange={setDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={priority}
                    onValueChange={(value) => setPriority(value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !selectedSampleId || !source || !destination || isSubmitting
                  }
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No tasks in queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(task.status)} text-white border-0`}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`${getPriorityColor(task.priority)} text-white border-0`}
                        >
                          Priority: {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium mb-1">
                        <span className="text-gray-700">{task.sampleId}</span>
                      </div>
                      {task.type === 'photograph' && task.description ? (
                        <div className="text-sm text-gray-600">
                          {task.description}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{task.source}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span>{task.destination}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <TaskTimer task={task} />
                        <span>
                          Created {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'queued' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onExecuteTask(task.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelTask(task.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
