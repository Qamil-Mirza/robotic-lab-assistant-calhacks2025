import React from 'react';
import { ProtocolPhase, PROTOCOL_PHASES } from '@/types';
import { CheckCircle2, Circle, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProtocolPhaseStepperProps {
  currentPhase: ProtocolPhase;
  completedPhases: ProtocolPhase[];
  status: 'active' | 'completed' | 'failed';
}

export function ProtocolPhaseStepper({
  currentPhase,
  completedPhases,
  status,
}: ProtocolPhaseStepperProps) {
  const getPhaseStatus = (phase: ProtocolPhase) => {
    if (completedPhases.includes(phase)) {
      return 'completed';
    }
    if (phase === currentPhase && status === 'failed') {
      return 'failed';
    }
    if (phase === currentPhase) {
      return 'active';
    }
    return 'pending';
  };

  const getIcon = (phaseStatus: string) => {
    switch (phaseStatus) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {PROTOCOL_PHASES.map((phase, index) => {
          const phaseStatus = getPhaseStatus(phase);
          const isLast = index === PROTOCOL_PHASES.length - 1;

          return (
            <React.Fragment key={phase}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full transition-colors',
                    phaseStatus === 'completed' && 'bg-green-50',
                    phaseStatus === 'active' && 'bg-blue-50',
                    phaseStatus === 'failed' && 'bg-red-50',
                    phaseStatus === 'pending' && 'bg-gray-50'
                  )}
                >
                  {getIcon(phaseStatus)}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    phaseStatus === 'completed' && 'text-green-700',
                    phaseStatus === 'active' && 'text-blue-700',
                    phaseStatus === 'failed' && 'text-red-700',
                    phaseStatus === 'pending' && 'text-gray-400'
                  )}
                >
                  {phase}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 transition-colors',
                    completedPhases.includes(PROTOCOL_PHASES[index + 1]) ||
                      (phaseStatus === 'completed' &&
                        PROTOCOL_PHASES[index + 1] === currentPhase)
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
