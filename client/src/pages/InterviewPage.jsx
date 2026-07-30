import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import PageHeader from "../components/interview/PageHeader";
import StepIndicator from "../components/interview/StepIndicator";
import CompanySelection from "../components/interview/CompanySelection";
import ExperienceSelection from "../components/interview/ExperienceSelection";
import InterviewDatePicker from "../components/interview/InterviewDatePicker";
import TopicsSelection from "../components/interview/Topicselection.jsx";
import InterviewPreviewCard from "../components/interview/InterviewPreviewCard";
import DangerZone from "../components/interview/DangerZone";
import API_BASE from "../utils/api";

const TOTAL_STEPS = 5;

function InterviewPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [targetCompany, setTargetCompany] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [focusTopics, setFocusTopics] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.targetCompany) setTargetCompany(data.targetCompany);
                if (data.experienceLevel) setExperienceLevel(data.experienceLevel);
                if (data.interviewDate) setInterviewDate(data.interviewDate);
                if (Array.isArray(data.focusTopics) && data.focusTopics.length) {
                    setFocusTopics(data.focusTopics);
                }
            })
            .catch(() => {});
    }, [navigate]);

    const canAdvance = useMemo(() => {
        if (step === 1) return true;
        if (step === 2) return Boolean(targetCompany);
        if (step === 3) return Boolean(experienceLevel);
        if (step === 4) return Boolean(interviewDate);
        if (step === 5) return focusTopics.length > 0;
        return false;
    }, [step, targetCompany, experienceLevel, interviewDate, focusTopics]);

    const handleSave = useCallback(async () => {
        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/api/users/onboarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetCompany,
                    experienceLevel,
                    interviewDate,
                    focusTopics,
                }),
            });
            if (res.ok) navigate("/dashboard");
        } catch {
            /* ignore */
        }
        setSaving(false);
    }, [targetCompany, experienceLevel, interviewDate, focusTopics, navigate]);

    const handleDelete = useCallback(async () => {
        setDeleting(true);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/api/users/onboarding`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetCompany: "",
                    experienceLevel: "",
                    interviewDate: "",
                    focusTopics: [],
                }),
            });
            if (res.ok) {
                setTargetCompany("");
                setExperienceLevel("");
                setInterviewDate("");
                setFocusTopics([]);
                setStep(1);
            }
        } catch {
            /* ignore */
        }
        setDeleting(false);
    }, []);

    const goNext = () => {
        if (!canAdvance) return;
        if (step < TOTAL_STEPS) setStep((s) => s + 1);
        else handleSave();
    };

    const goBack = () => {
        if (step > 1) setStep((s) => s - 1);
        else navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
            <div className="mx-auto max-w-xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
                <PageHeader />

                {/* Step form */}
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                        <StepIndicator current={step} />
                    </div>

                    <div className="p-4 sm:p-5">
                        {step === 1 && (
                            <div>
                                <h2 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                                    Your interview goal
                                </h2>
                                {targetCompany || experienceLevel || interviewDate || focusTopics.length > 0 ? (
                                    <InterviewPreviewCard
                                        targetCompany={targetCompany}
                                        experienceLevel={experienceLevel}
                                        interviewDate={interviewDate}
                                    />
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/50">
                                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            No interview goal set yet
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                                            Let's set your target company, experience level, date, and topics.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {step === 2 && (
                            <CompanySelection value={targetCompany} onChange={setTargetCompany} />
                        )}
                        {step === 3 && (
                            <ExperienceSelection value={experienceLevel} onChange={setExperienceLevel} />
                        )}
                        {step === 4 && (
                            <InterviewDatePicker value={interviewDate} onChange={setInterviewDate} />
                        )}
                        {step === 5 && (
                            <TopicsSelection value={focusTopics} onChange={setFocusTopics} />
                        )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                        <button
                            onClick={goBack}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft size={15} />
                            {step === 1 ? "Cancel" : "Back"}
                        </button>
                        <button
                            onClick={goNext}
                            disabled={!canAdvance || saving}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 dark:shadow-indigo-900"
                        >
                            {step === TOTAL_STEPS ? (
                                <>
                                    {saving ? "Saving…" : "Finish"}
                                    {!saving && <Check size={15} />}
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </div>
                </section>

                <DangerZone onDelete={handleDelete} loading={deleting} />
            </div>
        </div>
    );
}

export default InterviewPage;