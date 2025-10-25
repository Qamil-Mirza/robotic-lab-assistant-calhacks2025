import { Sample } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtocolPhaseStepper } from './protocol-phase-stepper';
import { MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SampleCardProps {
  sample: Sample;
}

export function SampleCard({ sample }: SampleCardProps) {
  const getStatusColor = (status: Sample['status']) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{sample.id}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {sample.storageLocation}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`${getStatusColor(sample.status)} text-white border-0`}
          >
            {sample.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Protocol Progress
            </span>
            <span className="text-sm text-gray-500">
              {sample.completedPhases.length}/8 phases
            </span>
          </div>
          <ProtocolPhaseStepper
            currentPhase={sample.currentPhase}
            completedPhases={sample.completedPhases}
            status={sample.status}
          />
        </div>

        <div className="flex items-center pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>
              Updated {formatDistanceToNow(new Date(sample.lastUpdated), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
