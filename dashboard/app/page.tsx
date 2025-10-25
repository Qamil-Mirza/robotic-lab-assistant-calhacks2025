'use client';

import { useEffect, useState } from 'react';
import { Sample, Task, RobotStatus, CreateTaskInput } from '@/types';
import { SampleCard } from '@/components/sample-card';
import { TaskQueue } from '@/components/task-queue';
import { RobotStatus as RobotStatusComponent } from '@/components/robot-status';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Beaker, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [robotStatus, setRobotStatus] = useState<RobotStatus | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch samples
  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const response = await fetch('/api/samples');
        const data = await response.json();
        setSamples(data);
      } catch (error) {
        console.error('Failed to fetch samples:', error);
      }
    };

    fetchSamples();
    const interval = setInterval(fetchSamples, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };

    fetchTasks();
    const interval = setInterval(fetchTasks, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch robot status
  useEffect(() => {
    const fetchRobotStatus = async () => {
      try {
        const response = await fetch('/api/robot/status');
        const data = await response.json();
        setRobotStatus(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch robot status:', error);
        setIsLoading(false);
      }
    };

    fetchRobotStatus();
    const interval = setInterval(fetchRobotStatus, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreateTask = async (taskInput: CreateTaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskInput),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleCancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter((t) => t.id !== taskId));
      }
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const handleEmergencyStop = () => {
    // In a real application, this would send a signal to the robot
    console.log('EMERGENCY STOP TRIGGERED');
    alert('Emergency stop activated! All robot operations halted.');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
              <Beaker className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lab Automation Dashboard
              </h1>
              <p className="text-sm text-gray-500">Unitree G1 Robot Control</p>
            </div>
          </div>
          {robotStatus && (
            <RobotStatusComponent
              status={robotStatus}
              onEmergencyStop={handleEmergencyStop}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Sample List */}
        <aside className="w-80 border-r bg-white p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Samples</h2>
            <p className="text-sm text-gray-500">{samples.length} total</p>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-2 pr-4">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors hover:bg-gray-50 cursor-pointer ${
                    selectedSample?.id === sample.id
                      ? 'border-teal-600 bg-teal-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-gray-900">{sample.id}</div>
                  <div className="text-xs text-gray-500">
                    {sample.storageLocation}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    Phase: {sample.currentPhase}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Sample Details Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Sample Details
              </h2>
              {selectedSample ? (
                <SampleCard
                  sample={selectedSample}
                />
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                  <p className="text-gray-500">
                    Select a sample from the sidebar to view details
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Task Queue Section */}
            <div>
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Robot Task Queue
              </h2>
              <TaskQueue
                tasks={tasks}
                samples={samples}
                onCreateTask={handleCreateTask}
                onCancelTask={handleCancelTask}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
