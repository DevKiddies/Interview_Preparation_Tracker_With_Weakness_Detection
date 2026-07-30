// FormStepper.jsx — horizontal step indicator used in the onboarding flow.
// Completed steps show a checkmark, the active step gets a ring highlight,
// and future steps are greyed out so the user knows where they are.

import React from "react";

function FormStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-4 px-4">
      <div className="relative w-full px-4">

        {/* Background track */}
        <div className="absolute top-1/2 left-4 right-4 h-0.75 bg-gray-200 dark:bg-slate-700 -translate-y-1/2 z-0" />

        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-4 h-0.75 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-300 ease-in-out"
          style={{
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${currentStep === 0 ? "0px" : "2rem"})`,
          }}
        />

        {/* Step nodes */}
        <div className="flex items-center justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={index} className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isActive
                      ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40"
                      : "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <span
                  className={`absolute top-10 text-center text-xs font-medium tracking-tight whitespace-nowrap hidden md:block transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600 font-bold"
                      : isCompleted
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-gray-400 dark:text-slate-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default FormStepper;
