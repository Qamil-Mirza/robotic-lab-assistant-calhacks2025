'use client';

import { RobotStatus as RobotStatusType } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface RobotStatusProps {
  status: RobotStatusType;
  onEmergencyStop: () => void;
}

export function RobotStatus({ status, onEmergencyStop }: RobotStatusProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isConnected = status.connectionStatus === 'connected';

  const handleEmergencyStop = () => {
    onEmergencyStop();
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'h-3 w-3 rounded-full',
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              )}
            />
            <span className="text-sm font-medium">
              Robot {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {status.currentActivity && isConnected && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="h-4 w-4" />
            <span>{status.currentActivity}</span>
          </div>
        )}

        <div className="ml-auto">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmDialog(true)}
            className="gap-2 bg-red-600 hover:bg-red-700"
            disabled={!isConnected}
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Stop
          </Button>
        </div>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Emergency Stop Confirmation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to trigger an emergency stop? This will
              immediately halt all robot operations and cancel all queued tasks.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Emergency Stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
