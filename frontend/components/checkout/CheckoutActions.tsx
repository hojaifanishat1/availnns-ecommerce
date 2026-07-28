"use client";

interface CheckoutActionsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  loading: boolean;
}

export default function CheckoutActions({
  currentStep,
  setCurrentStep,
  loading,
}: CheckoutActionsProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* STEP 1 */}
      {currentStep === 1 && (
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="w-full rounded-xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800"
        >
          Continue Payment
        </button>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="w-1/3 rounded-xl border py-4 font-bold transition hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="w-full rounded-xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800"
          >
            Continue Review
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="w-1/3 rounded-xl border py-4 font-bold transition hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-4 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      )}
    </div>
  );
}
