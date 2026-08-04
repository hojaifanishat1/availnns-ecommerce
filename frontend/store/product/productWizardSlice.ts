import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WizardState {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
}

const initialState: WizardState = {
  currentStep: 1,
  completedSteps: [],
  totalSteps: 10,
};

const productWizardSlice = createSlice({
  name: "productWizard",
  initialState,
  reducers: {
    nextStep: (state) => {
      // বর্তমান স্টেপটি কমপ্লিটেড লিস্টে না থাকলে যোগ করা
      if (!state.completedSteps.includes(state.currentStep)) {
        state.completedSteps.push(state.currentStep);
      }

      // টোটাল স্টেপের বেশি যেন না যায়
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },

    previousStep: (state) => {
      // ১ এর নিচে যেন না নামে
      state.currentStep = Math.max(1, state.currentStep - 1);
    },

    goToStep: (state, action: PayloadAction<number>) => {
      const targetStep = action.payload;
      if (targetStep >= 1 && targetStep <= state.totalSteps) {
        state.currentStep = targetStep;
      }
    },

    completeStep: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (step >= 1 && step <= state.totalSteps && !state.completedSteps.includes(step)) {
        state.completedSteps.push(step);
      }
    },

    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload;
    },

    resetWizard: (state) => {
      state.currentStep = 1;
      state.completedSteps = [];
    },
  },
});

export const {
  nextStep,
  previousStep,
  goToStep,
  completeStep,
  setTotalSteps,
  resetWizard,
} = productWizardSlice.actions;

export default productWizardSlice.reducer;
