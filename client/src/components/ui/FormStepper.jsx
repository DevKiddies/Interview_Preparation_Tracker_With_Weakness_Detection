import React from "react";

function FormStepper({ steps, currentStep }) {
  return (
    <div className="w-full py-4 px-4">
      {/* The outer container needs relative positioning, and we add horizontal padding 
        equal to half the width of your step bubbles (w-8 = 2rem, so 1rem/px-4 padding).
        This guarantees the absolute progress lines stay perfectly confined.
      */}
      <div className="relative w-full px-4">
        
        {/* BACKGROUND TRACK LINE: Confined precisely within the padding track */}
        <div className="absolute top-1/2 left-4 right-4 h-[3px] bg-gray-200 -translate-y-1/2 z-0" />

        {/* PROGRESS FILL LINE: Dynamically fills from the exact center of step 1 to step 4 */}
        <div 
          className="absolute top-1/2 left-4 h-[3px] bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-300 ease-in-out" 
          style={{ 
            width: `calc(${(currentStep / (steps.length - 1)) * 100}% - ${currentStep === 0 ? '0px' : '2rem'})` 
          }}
        />

        {/* STEP NODES CONTAINER */}
        <div className="flex items-center justify-between w-full relative z-10">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div key={index} className="flex flex-col items-center relative">
                
                {/* Circle Bubble Indicator */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : isActive
                      ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Step Text Label */}
                <span
                  className={`absolute top-10 text-center text-xs font-medium tracking-tight whitespace-nowrap hidden md:block transition-all duration-200 ${
                    isActive ? "text-indigo-600 font-bold" : isCompleted ? "text-slate-700" : "text-gray-400"
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