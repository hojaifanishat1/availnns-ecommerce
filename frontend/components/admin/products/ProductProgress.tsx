"use client";

import {
  useProductWizard
} from "@/context/ProductWizardContext";

const steps = [
  "Basic",
  "Media",
  "Pricing",
  "Variants",
  "Inventory",
  "Shipping",
  "Attributes",
  "Specification",
  "SEO",
  "Review"
];

export default function ProductProgress() {
  const {
    currentStep,
    completedSteps,
    goToStep
  } = useProductWizard();

  return (
    <div className="bg-white border rounded-xl p-4 space-y-2 shadow-sm">
      <div className="px-2 pb-2 mb-2 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Progress
        </h3>
      </div>

      {
        steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);

          return (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(stepNumber)}
              className={`
                w-full
                flex
                items-center
                gap-3
                p-2.5
                rounded-lg
                text-sm
                font-medium
                transition-colors
                text-left
                ${
                  isActive
                    ? "bg-black text-white"
                    : isCompleted
                    ? "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <div
                className={`
                  w-6
                  h-6
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-xs
                  font-semibold
                  border
                  ${
                    isActive
                      ? "border-white bg-white text-black"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 text-gray-500"
                  }
                `}
              >
                {
                  isCompleted && !isActive
                    ? "✓"
                    : stepNumber
                }
              </div>

              <span className="flex-1">{step}</span>
            </button>
          );
        })
      }
    </div>
  );
}
