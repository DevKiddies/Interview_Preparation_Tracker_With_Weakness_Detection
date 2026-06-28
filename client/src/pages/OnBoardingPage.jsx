// OnBoardingPage.jsx — 4-step wizard that collects the user's target company,
// interview date, experience level, and focus topics right after registration.
// Data is saved via /api/users/onboarding and the user is then sent to the dashboard.
// The "Next" button stays disabled until the current step has a valid selection.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormStepper from "../components/ui/FormStepper.jsx";
import API_BASE from "../utils/api.js";

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
      const response = await fetch(`${API_BASE}/api/users/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    } catch {
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
    <div className="h-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-200">

      {/* Stepper */}
      <div className="w-full max-w-2xl mx-auto px-6 pt-6 pb-0 shrink-0">
        <FormStepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Heading */}
      <div className="text-center px-4 pt-2 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">
          Let's personalize your experience
        </h1>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>

      {/* Card — fills remaining space */}
      <div className="flex-1 flex items-stretch justify-center px-4 pb-6 min-h-0">
        <div className="w-full max-w-2xl flex flex-col border border-gray-200 dark:border-slate-700 rounded-2xl shadow-lg bg-white dark:bg-slate-800 overflow-hidden">

          {/* Step content — scrollable only if it overflows */}
          <div className="flex-1 overflow-y-auto px-6 pt-5 pb-2 text-left onboarding-scroll">
            {currentStep === 0 && <TargetStep formData={formData} setFormData={setFormData} />}
            {currentStep === 1 && <DateStep formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <ExperienceStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <TopicsStep formData={formData} setFormData={setFormData} />}
          </div>

          {/* Navigation — always pinned to bottom of card */}
          <div className="shrink-0 flex justify-between items-center px-6 py-4 border-t border-gray-100 dark:border-slate-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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

        </div>
      </div>

    </div>
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
      <h2 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">What's your target?</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
        This helps us curate the right difficulty level for your mock tests.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {targets.map((target) => {
          const isSelected = formData.targetCompany === target.id;
          return (
            <div
              key={target.id}
              onClick={() => setFormData({ ...formData, targetCompany: target.id })}
              className={`p-5 rounded-xl cursor-pointer transition-all flex items-center justify-center border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600"
              }`}
            >
              <p className={`font-semibold text-sm ${isSelected ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>
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
      <h2 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">When is your interview?</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Set a target date to build your study schedule.</p>
      <div className="flex flex-col items-center py-8 gap-5">
        <input
          type="date"
          value={formData.interviewDate}
          onChange={(e) => setFormData({ ...formData, interviewDate: e.target.value })}
          className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 shadow-sm w-full max-w-xs transition-all"
        />
        {formData.interviewDate && (
          <div className="bg-amber-500 text-white font-semibold text-sm px-5 py-1.5 rounded-full shadow-sm">
            ~ {daysRemaining} days remaining
          </div>
        )}
      </div>
    </>
  );
}

function ExperienceStep({ formData, setFormData }) {
  const levels = [
    { id: "fresher", label: "Student / Fresher", desc: "0–1 years of experience" },
    { id: "mid", label: "Mid-level", desc: "2–4 years of experience" },
    { id: "senior", label: "Senior", desc: "5+ years of experience" },
  ];
  return (
    <>
      <h2 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">Experience Level</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">We'll adjust the weightage of System Design vs DSA accordingly.</p>
      <div className="flex flex-col gap-3">
        {levels.map((level) => {
          const isSelected = formData.experienceLevel === level.id;
          return (
            <div
              key={level.id}
              onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
              className={`w-full p-4 rounded-xl cursor-pointer transition-all flex items-center gap-4 border ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isSelected ? "border-white bg-white" : "border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-600"
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className={`font-semibold text-sm ${isSelected ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>{level.label}</p>
                <p className={`text-xs mt-0.5 ${isSelected ? "text-indigo-100" : "text-gray-400 dark:text-slate-400"}`}>{level.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TopicsStep({ formData, setFormData }) {
  const [search, setSearch] = React.useState("");
  const topics = [
    // Languages
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift",
    // DSA
    "Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Heaps", "Tries",
    "Hashing", "Sorting & Searching", "Recursion", "Dynamic Programming",
    "Greedy Algorithms", "Backtracking", "Bit Manipulation",
    "Sliding Window", "Two Pointers", "Binary Search", "Divide & Conquer",
    // OOP & Design
    "OOP Concepts", "OOP in Java", "Design Patterns", "SOLID Principles",
    // System Design
    "System Design", "Low Level Design", "Microservices", "REST APIs",
    "Message Queues", "Caching", "Load Balancing", "Rate Limiting",
    // Databases
    "SQL", "Database Design", "Indexing & Query Optimization", "Transactions & ACID",
    "NoSQL", "MongoDB", "Redis",
    // Web & Frameworks
    "Web Programming", "React", "Node.js", "SpringBoot", "Django", "FastAPI",
    // CS Fundamentals
    "Operating Systems", "Process & Threads", "Memory Management",
    "Computer Networks", "TCP/IP", "HTTP & HTTPS",
    "DBMS", "Compiler Design", "Computer Architecture",
    // Tools & Practices
    "Git & Version Control", "Docker", "Kubernetes", "CI/CD",
    "Time & Space Complexity", "Problem Solving",
  ];
  const toggleTopic = (topic) => {
    const active = [...formData.focusTopics];
    if (active.includes(topic)) {
      setFormData({ ...formData, focusTopics: active.filter((t) => t !== topic) });
    } else {
      setFormData({ ...formData, focusTopics: [...active, topic] });
    }
  };

  const filtered = topics.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topics you know well</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Select topics you're already comfortable with.</p>
        </div>
        <div className="relative shrink-0">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-40 transition-all"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5 mt-4">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-slate-500">No topics match your search.</p>
        )}
        {filtered.map((topic) => {
          const isSelected = formData.focusTopics.includes(topic);
          return (
            <button
              key={topic}
              onClick={() => toggleTopic(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-400"
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
