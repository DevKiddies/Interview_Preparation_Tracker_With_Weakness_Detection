// OnBoardingPage.jsx — 5-step wizard that collects the user's target company,
// interview date, experience level, focus topics, and profile (username + avatar).
// Data is saved via /api/users/onboarding and the user is then sent to the dashboard.
// The "Next" button stays disabled until the current step has a valid selection.

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FormStepper from "../components/ui/FormStepper.jsx";
import API_BASE from "../utils/api.js";
import { setCachedProfile } from "../utils/profileCache";

function OnBoardingPage() {
  const steps = [
    "Select Target Companies",
    "Select Interview Date",
    "Select Experience Level",
    "Select Focus Topics",
    "Set Up Your Profile",
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    targetCompany: "",
    interviewDate: "",
    experienceLevel: "",
    focusTopics: [],
    username: localStorage.getItem("username") || "",
    avatarUrl: localStorage.getItem("avatarUrl") || "",
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
          username: formData.username.trim(),
          avatarUrl: formData.avatarUrl,
        }),
      });
      if (response.ok) {
        if (formData.username.trim()) localStorage.setItem("username", formData.username.trim());
        if (formData.avatarUrl) localStorage.setItem("avatarUrl", formData.avatarUrl);
        setCachedProfile({
          username: formData.username.trim(),
          avatarUrl: formData.avatarUrl,
          targetCompany: formData.targetCompany,
          interviewDate: formData.interviewDate,
          experienceLevel: formData.experienceLevel,
          focusTopics: formData.focusTopics,
          onboarded: true,
        });
        window.dispatchEvent(new CustomEvent("user-profile-updated"));
        navigate("/dashboard");
      } else {
        const msg = await response.text();
        setError(msg || "Failed to save onboarding data. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please check your connection.");
    }
  };

  const _t = new Date();
  const todayStr = `${_t.getFullYear()}-${String(_t.getMonth() + 1).padStart(2, "0")}-${String(_t.getDate()).padStart(2, "0")}`;

  const isNextDisabled = () => {
    if (currentStep === 0) return !formData.targetCompany;
    if (currentStep === 1) return !formData.interviewDate || formData.interviewDate < todayStr;
    if (currentStep === 2) return !formData.experienceLevel;
    if (currentStep === 3) return formData.focusTopics.length === 0;
    if (currentStep === 4) return !formData.username.trim();
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

          {/* Step content */}
          <div className={`flex-1 min-h-0 px-6 text-left ${
            currentStep === 4
              ? "flex items-center overflow-hidden py-6"
              : "overflow-y-auto pt-5 pb-2 onboarding-scroll"
          }`}>
            {currentStep === 0 && <TargetStep formData={formData} setFormData={setFormData} />}
            {currentStep === 1 && <DateStep formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <ExperienceStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <TopicsStep formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <ProfileStep formData={formData} setFormData={setFormData} />}
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calculateDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff >= 0 ? diff : -1;
  };
  const daysRemaining = calculateDaysRemaining(formData.interviewDate);
  const isPast = daysRemaining !== null && daysRemaining < 0;

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val && val < todayStr) return;
    setFormData({ ...formData, interviewDate: val });
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">When is your interview?</h2>
      <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">Set a target date to build your study schedule.</p>
      <div className="flex flex-col items-center py-8 gap-5">
        <input
          type="date"
          value={formData.interviewDate}
          min={todayStr}
          onChange={handleDateChange}
          className={`border rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 shadow-sm w-full max-w-xs transition-all ${
            isPast
              ? "border-rose-400 focus:ring-rose-400"
              : "border-gray-300 dark:border-slate-600"
          }`}
        />
        {isPast && (
          <p className="text-xs font-medium text-rose-500">Please choose a future date.</p>
        )}
        {formData.interviewDate && !isPast && (
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

function ProfileStep({ formData, setFormData }) {
  const fileInputRef = useRef(null);
  const [imgError, setImgError] = React.useState(false);
  const [compressing, setCompressing] = React.useState(false);

  const initials = formData.username
    ? formData.username.slice(0, 2).toUpperCase()
    : "U";

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (ev) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const MAX = 256;
          let { width, height } = img;
          if (width > height) {
            if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
          } else {
            if (height > MAX) { width = Math.round((width * MAX) / height); height = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }
    setCompressing(true);
    try {
      const dataUrl = await compressImage(file);
      setFormData({ ...formData, avatarUrl: dataUrl });
      setImgError(false);
    } catch { /* ignore */ }
    setCompressing(false);
  };

  return (
    <div className="w-full flex items-center gap-8">

      {/* Left — Avatar */}
      <div className="flex flex-col items-center gap-3 shrink-0">
        <div className="relative">
          {formData.avatarUrl && !imgError ? (
            <img
              src={formData.avatarUrl}
              alt="avatar"
              onError={() => setImgError(true)}
              className="h-32 w-32 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-5xl font-bold text-white shadow-xl ring-4 ring-indigo-500/30">
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={compressing}
            title="Upload photo"
            className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white dark:ring-slate-800 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {compressing ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Upload photo</p>
      </div>

      {/* Vertical divider */}
      <div className="w-px self-stretch bg-slate-200 dark:bg-slate-700 shrink-0" />

      {/* Right — Form */}
      <div className="flex-1 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set up your profile</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            You can always update these from your profile settings.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Display Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter your display name"
            maxLength={30}
            className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">
            This is how others will see you on the platform.
          </p>
        </div>
      </div>

    </div>
  );
}

const TOPIC_CATEGORIES = [
  {
    label: "LANGUAGES",
    unselected: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400",
    selected:   "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/20",
    topics: ["C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift"],
  },
  {
    label: "DATA STRUCTURES & ALGORITHMS",
    unselected: "bg-violet-500/10 border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400",
    selected:   "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20",
    topics: [
      "Arrays", "Linked Lists", "Stacks & Queues", "Trees", "Graphs", "Heaps", "Tries",
      "Hashing", "Sorting & Searching", "Recursion", "Dynamic Programming",
      "Greedy Algorithms", "Backtracking", "Bit Manipulation",
      "Sliding Window", "Two Pointers", "Binary Search", "Divide & Conquer",
    ],
  },
  {
    label: "OOP & DESIGN",
    unselected: "bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400",
    selected:   "bg-teal-600 border-teal-500 text-white shadow-md shadow-teal-500/20",
    topics: ["OOP Concepts", "OOP in Java", "Design Patterns", "SOLID Principles"],
  },
  {
    label: "SYSTEM DESIGN",
    unselected: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400",
    selected:   "bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-500/20",
    topics: ["System Design", "Low Level Design", "Microservices", "REST APIs", "Message Queues", "Caching", "Load Balancing", "Rate Limiting"],
  },
  {
    label: "DATABASES",
    unselected: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400",
    selected:   "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/20",
    topics: ["SQL", "Database Design", "Indexing & Query Optimization", "Transactions & ACID", "NoSQL", "MongoDB", "Redis"],
  },
  {
    label: "WEB & FRAMEWORKS",
    unselected: "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400",
    selected:   "bg-amber-500 border-amber-400 text-white shadow-md shadow-amber-500/20",
    topics: ["Web Programming", "React", "Node.js", "SpringBoot", "Django", "FastAPI"],
  },
  {
    label: "CS FUNDAMENTALS",
    unselected: "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400",
    selected:   "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-500/20",
    topics: ["Operating Systems", "Process & Threads", "Memory Management", "Computer Networks", "TCP/IP", "HTTP & HTTPS", "DBMS", "Compiler Design", "Computer Architecture"],
  },
  {
    label: "TOOLS & PRACTICES",
    unselected: "bg-slate-500/10 border-slate-500/30 text-slate-300 hover:bg-slate-500/20 hover:border-slate-400",
    selected:   "bg-slate-500 border-slate-400 text-white shadow-md shadow-slate-500/20",
    topics: ["Git & Version Control", "Docker", "Kubernetes", "CI/CD", "Time & Space Complexity", "Problem Solving"],
  },
];

function TopicsStep({ formData, setFormData }) {
  const [search, setSearch] = React.useState("");

  const toggleTopic = (topic) => {
    const active = [...formData.focusTopics];
    setFormData({
      ...formData,
      focusTopics: active.includes(topic)
        ? active.filter((t) => t !== topic)
        : [...active, topic],
    });
  };

  const q = search.toLowerCase();
  const visibleCategories = TOPIC_CATEGORIES.map((cat) => ({
    ...cat,
    topics: q ? cat.topics.filter((t) => t.toLowerCase().includes(q)) : cat.topics,
  })).filter((cat) => cat.topics.length > 0);

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
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

      {visibleCategories.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-slate-500">No topics match your search.</p>
      )}

      <div className="flex flex-col gap-5">
        {visibleCategories.map((cat) => (
          <div key={cat.label}>
            <p className="mb-2 text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500">
              {cat.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {cat.topics.map((topic) => {
                const isSelected = formData.focusTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected ? cat.selected : cat.unselected
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
