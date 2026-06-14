import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormStepper from "../components/ui/FormStepper.jsx";
import Card from "../components/ui/Card.jsx";

function OnBoardingPage() {
  const steps = [
    "Select Target Companies",
    "Select Interview Date",
    "Select Experience Level",
    "Select Focus Topics",
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    targetCompany: "",
    interviewDate: "",
    experienceLevel: "",
    focusTopics: [],
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetCompany: formData.targetCompany,
          interviewDate: formData.interviewDate,
          experienceLevel: formData.experienceLevel,
          focusTopics: formData.focusTopics,
        }),
      });

      if (response.ok) {
        navigate("/dashboard");
      } else {
        setError("Failed to save onboarding data. Please try again.");
      }
    } catch  {
      setError("Something went wrong. Please check your connection.");
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 0) return !formData.targetCompany;
    if (currentStep === 1) return !formData.interviewDate;
    if (currentStep === 2) return !formData.experienceLevel;
    if (currentStep === 3) return formData.focusTopics.length === 0;
    return false;
  };

  return (
    <>
      <div className="max-w-xl mx-auto mt-8 px-4">
        <FormStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="flex justify-center mt-6">
        <div className="text-xl font-bold text-center mx-auto w-[92%] max-w-sm sm:p-2">
          <h1 className="text-2xl text-slate-800">Let's personalize your experience</h1>
        </div>
      </div>

      {error && <p className="text-center text-red-500 text-sm mt-2">{error}</p>}

      <Card width="640px" height="auto">
        {currentStep === 0 && <TargetStep formData={formData} setFormData={setFormData} />}
        {currentStep === 1 && <DateStep formData={formData} setFormData={setFormData} />}
        {currentStep === 2 && <ExperienceStep formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <TopicsStep formData={formData} setFormData={setFormData} />}

        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            &lt; Back
          </button>

          <button
            onClick={handleNext}
            disabled={isNextDisabled()}
            className={`text-sm font-medium text-white px-6 py-2 rounded-lg transition-all ${
              currentStep === steps.length - 1
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-100"
                : "bg-indigo-600 hover:bg-indigo-700"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {currentStep === steps.length - 1 ? "Go to Dashboard ✓" : "Next >"}
          </button>
        </div>
      </Card>
    </>
  );
}

export default OnBoardingPage;

function TargetStep({ formData, setFormData }) {
  const targets = [
    { id: "faang", label: "FAANG / Big Tech" },
    { id: "product", label: "Product Companies" },
    { id: "service", label: "Service Companies" },
    { id: "competitive", label: "Competitive Exams" },
  ];
  return (
    <>
      <h1 className="text-xl font-bold mb-1 text-left text-slate-900">What's your target?</h1>
      <p className="text-gray-500 text-sm mb-6 text-left">
        This helps us curate the right difficulty level for your mock tests.
      </p>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
        {targets.map((target) => {
          const isSelected = formData.targetCompany === target.id;
          return (
            <div
              key={target.id}
              onClick={() => setFormData({ ...formData, targetCompany: target.id })}
              className={`w-full sm:w-[calc(50%-0.5rem)] p-6 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] box-border border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-gray-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <p className={`font-semibold text-base ${isSelected ? "text-white" : "text-slate-700"}`}>
                {target.label}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DateStep({ formData, setFormData }) {
  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : 0;
  };
  const daysRemaining = calculateDaysRemaining(formData.interviewDate);
  return (
    <>
      <h1 className="text-xl font-bold mb-1 text-left text-slate-900">When is your interview?</h1>
      <p className="text-gray-500 text-sm mb-6 text-left">Set a target date to build your study schedule.</p>
      <div className="flex flex-col items-center py-6">
        <input
          type="date"
          value={formData.interviewDate}
          onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white shadow-sm w-full max-w-xs transition-all"
        />
        {formData.interviewDate && (
          <div className="mt-6 bg-amber-500 text-white font-semibold text-sm px-4 py-1.5 rounded-full shadow-sm shadow-amber-100">
            ~ {daysRemaining} days remaining
          </div>
        )}
      </div>
    </>
  );
}

function ExperienceStep({ formData, setFormData }) {
  const levels = [
    { id: "fresher", label: "Student / Fresher", desc: "0-1 years of experience" },
    { id: "mid", label: "Mid-level", desc: "2-4 years of experience" },
    { id: "senior", label: "Senior", desc: "5+ years of experience" },
  ];
  return (
    <>
      <h1 className="text-xl font-bold mb-1 text-left text-slate-900">Experience Level</h1>
      <p className="text-gray-500 text-sm mb-6 text-left">We'll adjust the weightage of System Design vs DSA accordingly.</p>
      <div className="flex flex-col gap-3 w-full">
        {levels.map((level) => {
          const isSelected = formData.experienceLevel === level.id;
          return (
            <div
              key={level.id}
              onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
              className={`w-full p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 border text-left ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white border-gray-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? "border-white bg-white" : "border-gray-300 bg-white"
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className={`font-semibold text-base ${isSelected ? "text-white" : "text-slate-800"}`}>{level.label}</p>
                <p className={`text-xs ${isSelected ? "text-indigo-100" : "text-gray-400"}`}>{level.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TopicsStep({ formData, setFormData }) {
  const topics = [
    "C++", "OOP in Java", "Database", "JavaScript",
    "Sliding Window", "Web Programming", "Data Structure",
    "SpringBoot", "System Design"
  ];
  const toggleTopic = (topic) => {
    const activeTopics = [...formData.focusTopics];
    if (activeTopics.includes(topic)) {
      setFormData({ ...formData, focusTopics: activeTopics.filter((t) => t !== topic) });
    } else {
      setFormData({ ...formData, focusTopics: [...activeTopics, topic] });
    }
  };
  return (
    <>
      <h1 className="text-xl font-bold mb-1 text-left text-slate-900">Topics you know well</h1>
      <p className="text-gray-500 text-sm mb-6 text-left">Select topics you're already comfortable with.</p>
      <div className="flex flex-wrap gap-2.5 justify-start w-full">
        {topics.map((topic) => {
          const isSelected = formData.focusTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-slate-600 hover:border-gray-400"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>
    </>
  );
}