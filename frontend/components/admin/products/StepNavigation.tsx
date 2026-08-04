"use client";

import {
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  useProductWizard
} from "@/context/ProductWizardContext";

export default function StepNavigation({
  totalSteps = 10,
  onNext,
  onFinish,
  isNextDisabled = false,
}: {
  totalSteps?: number;
  onNext?: () => void | Promise<boolean | void>;
  onFinish?: () => void | Promise<boolean | void>;
  isNextDisabled?: boolean;
}) {
  const {
    currentStep,
    nextStep,
    previousStep
  } = useProductWizard();

  const isLastStep = currentStep >= totalSteps;

  const handleNext = async () => {
    if (isLastStep) {
      if (onFinish) {
        const result = await onFinish();
        if (result === false) return;
      }
      return;
    }

    if (onNext) {
      const result = await onNext();
      if (result === false) return;
    }
    nextStep();
  };

  return (
    <div className="flex justify-between items-center mt-6 pt-4 border-t">
      <button
        type="button"
        onClick={previousStep}
        disabled={currentStep === 1}
        className="px-4 py-2 border rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </button>

      <span className="text-sm text-gray-500 font-medium">
        Step {currentStep} of {totalSteps}
      </span>

      <button
        type="button"
        onClick={handleNext}
        disabled={isNextDisabled}
        className="px-4 py-2 bg-black text-white rounded flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
      >
        {isLastStep ? "Finish" : "Next"}
        {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
      </button>
    </div>
  );
}
