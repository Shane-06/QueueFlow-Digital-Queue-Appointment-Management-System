import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  title: string;
  description?: string;
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="w-full py-3 px-2 bg-white border border-slate-200 rounded-lg shadow-card">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.title}
              className={`relative z-10 flex flex-col items-center group ${
                onStepClick && isCompleted ? 'cursor-pointer' : ''
              }`}
              onClick={() => onStepClick && isCompleted && onStepClick(index)}
            >
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-150 border-2 ${
                  isCompleted
                    ? 'bg-[#0f243d] border-[#0f243d] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-[#0f243d] text-[#0f243d] ring-4 ring-brand-100 shadow-xs'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : index + 1}
              </div>

              {/* Title */}
              <div className="text-center mt-2">
                <div
                  className={`text-xs font-medium tracking-tight ${
                    isCurrent
                      ? 'text-[#0f243d] font-bold'
                      : isCompleted
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </div>
                {step.description && (
                  <div className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
