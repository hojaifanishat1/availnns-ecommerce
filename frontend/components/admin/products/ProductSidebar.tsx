"use client";

import {
  Package,
  Image,
  DollarSign,
  Layers,
  Truck,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
} from "lucide-react";

import {
  useProductWizard
} from "@/context/ProductWizardContext";

interface MenuItem {
  label: string;
  icon: any;
}

const menu: MenuItem[] = [
  {
    label: "Basic Information",
    icon: Package
  },
  {
    label: "Media",
    icon: Image
  },
  {
    label: "Pricing",
    icon: DollarSign
  },
  {
    label: "Variants",
    icon: Layers
  },
  {
    label: "Inventory",
    icon: ShieldAlert
  },
  {
    label: "Shipping",
    icon: Truck
  },
  {
    label: "Attributes",
    icon: SlidersHorizontal
  },
  {
    label: "Specifications",
    icon: FileText
  },
  {
    label: "SEO",
    icon: Search
  },
  {
    label: "Review",
    icon: CheckCircle2
  }
];

export default function ProductSidebar() {
  const {
    currentStep,
    goToStep,
    completedSteps
  } = useProductWizard();

  return (
    <div
      className="
        bg-white
        border
        rounded-xl
        p-4
        space-y-1.5
        shadow-sm
      "
    >
      <div className="px-3 pb-3 mb-2 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Wizard Steps
        </h3>
      </div>

      {
        menu.map((item, index) => {
          const stepNumber = index + 1;
          const Icon = item.icon;
          const isActive = currentStep === stepNumber;
          const isCompleted = completedSteps.includes(stepNumber);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => goToStep(stepNumber)}
              className={`
                w-full
                flex
                items-center
                justify-between
                px-3
                py-2.5
                rounded-lg
                text-sm
                font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-black text-white"
                    : isCompleted
                    ? "bg-gray-50 text-gray-900 hover:bg-gray-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-white" : "text-gray-500"} />
                <span>{item.label}</span>
              </div>

              {isCompleted && !isActive && (
                <span className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </button>
          );
        })
      }
    </div>
  );
}
