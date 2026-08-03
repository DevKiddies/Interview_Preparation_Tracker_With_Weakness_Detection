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
import InterviewResultStep from "../components/interview/InterviewResultStep";
import DangerZone from "../components/interview/DangerZone";
import API_BASE from "../utils/api";
import { getInterviewClosed, setInterviewClosed, clearInterviewClosed } from "../utils/interviewState";
import { getCachedProfile, setCachedProfile } from "../utils/profileCache";

const TOTAL_STEPS = 5;

const RESULT_LABELS = {
    SELECTED: "Selected",
    NOT_SELECTED: "Not Selected",
    ARCHIVED: "Archived",
    DELETED: "Deleted",
};

function InterviewPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(() => (getInterviewClosed() ? 1 : 0));
    const [selectedResult, setSelectedResult] = useState(null);
    const [resultApplied, setResultApplied] = useState(false);
    const [isCompleted, setIsCompleted] = useState(() => !getInterviewClosed());
    const [targetCompany, setTargetCompany] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [interviewDate, setInterviewDate] = useState("");
    const [focusTopics, setFocusTopics] = useState([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [interviews, setInterviews] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        fetch(`${API_BASE}/api/interviews`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data)) setInterviews(data);
            })
            .catch(() => {});

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
                setCachedProfile(data);

                const closed = getInterviewClosed();
                let completed = false;
                if (!closed && data.interviewDate) {
                    const target = new Date(data.interviewDate);
                    const today = new Date();
                    target.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);
                    completed =
                        Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24)) <= 0;
                }
                setIsCompleted(completed);
                if (!closed) setStep(completed ? 0 : 1);
            })
            .catch(() => {});
    }, [navigate]);

    const canAdvance = useMemo(() => {
        if (step === 0) return selectedResult !== null;
        if (step === 1) return true;
        if (step === 2) return Boolean(targetCompany);
        if (step === 3) return Boolean(experienceLevel);
        if (step === 4) return Boolean(interviewDate);
        if (step === 5) return focusTopics.length > 0;
        return false;
    }, [step, selectedResult, targetCompany, experienceLevel, interviewDate, focusTopics]);

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
            if (res.ok) {
                setCachedProfile({
                    ...getCachedProfile(),
                    targetCompany,
                    experienceLevel,
                    interviewDate,
                    focusTopics,
                });
                navigate("/dashboard");
            }
        } catch {
            /* ignore */
        }
        setSaving(false);
        clearInterviewClosed();
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
                setCachedProfile({
                    ...getCachedProfile(),
                    targetCompany: "",
                    experienceLevel: "",
                    interviewDate: "",
                    focusTopics: [],
                });
                setStep(1);
            }
        } catch {
            /* ignore */
        }
        setDeleting(false);
        clearInterviewClosed();
    }, []);

    // Archive the current interview: closes the active track (kept in history
    // as ARCHIVED), clears the current goal so the preparation card reads
    // empty, and drops the settings page back to step 1 so a new goal can be
    // set for the next interview.
    const handleArchive = useCallback(async () => {
        setArchiving(true);
        const token = localStorage.getItem("token");
        try {
            const active = interviews.find((i) => i.status === "ACTIVE");
            if (token && active) {
                await fetch(`${API_BASE}/api/interviews/${active.id}/result`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ result: "ARCHIVED" }),
                }).catch(() => {});
                setInterviews((prev) =>
                    prev.map((i) => (i.id === active.id ? { ...i, status: "ARCHIVED" } : i))
                );
            }
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
                setCachedProfile({
                    ...getCachedProfile(),
                    targetCompany: "",
                    experienceLevel: "",
                    interviewDate: "",
                    focusTopics: [],
                });
                setStep(1);
            }
        } catch {
            /* ignore */
        }
        setArchiving(false);
        clearInterviewClosed();
    }, [interviews]);

    const goNext = () => {
        if (!canAdvance) return;
        if (step === 0) {
            setInterviewClosed(selectedResult);
            setResultApplied(true);
            setIsCompleted(false);
            markResult(selectedResult);
            return;
        }
        if (step < TOTAL_STEPS) setStep((s) => s + 1);
        else handleSave();
    };

    // Persist the outcome (SELECTED / NOT_SELECTED / ARCHIVED / DELETED) to the
    // active interview track so it shows up in interview history. Fire-and-forget
    // — localStorage still drives the current-page UX.
    const markResult = useCallback((result) => {
        const token = localStorage.getItem("token");
        const active = interviews.find((i) => i.status === "ACTIVE");
        if (!token || !active) return;
        fetch(`${API_BASE}/api/interviews/${active.id}/result`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ result }),
        }).catch(() => {});
    }, [interviews]);

    const goBack = () => {
        if (step === 0) {
            navigate("/dashboard");
            return;
        }
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
                        <StepIndicator current={step} withResult={isCompleted} />
                    </div>

                    <div className="p-4 sm:p-5">
                        {step === 0 && !resultApplied && (
                            <InterviewResultStep value={selectedResult} onChange={setSelectedResult} />
                        )}
                        {step === 0 && resultApplied && (
                            <div className="flex flex-col items-center gap-3 py-8 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                                    <Check size={26} strokeWidth={3} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                    Interview marked as {RESULT_LABELS[selectedResult] || "complete"}
                                </h2>
                                <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                                    Your preparation card is now clear. Start a new interview goal or head back
                                    to the dashboard.
                                </p>
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                                    <button
                                        onClick={() => navigate("/dashboard")}
                                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-[0.98] dark:shadow-indigo-900"
                                    >
                                        Go to Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            setResultApplied(false);
                                            setSelectedResult(null);
                                            setStep(1);
                                        }}
                                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                        Start New Interview
                                    </button>
                                </div>
                            </div>
                        )}
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

                    {!(step === 0 && resultApplied) && (
                        <div className="flex items-center gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
                            <button
                                onClick={goBack}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            >
                                <ArrowLeft size={15} />
                                {step === 0 ? "Back to Dashboard" : step === 1 ? "Cancel" : "Back"}
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
                                ) : step === 0 ? (
                                    <>
                                        Confirm
                                        <Check size={15} />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </section>

                <DangerZone onDelete={handleDelete} loading={deleting} onArchive={handleArchive} archiving={archiving} />
            </div>
        </div>
    );
}

export default InterviewPage;