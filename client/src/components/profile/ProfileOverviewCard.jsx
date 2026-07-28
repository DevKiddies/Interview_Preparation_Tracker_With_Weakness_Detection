import { useRef, useState, useEffect } from "react";
import { Camera, Mail, ShieldCheck, Pencil, Lock, Briefcase, Calendar, X } from "lucide-react";

function EditAction({ onClick, label }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="inline-flex shrink-0 items-center gap-1 rounded text-[11px] font-medium text-[#8A93A3] transition-colors hover:text-[#2647D6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2647D6] dark:text-[#6B7280] dark:hover:text-[#7C97FF]"
        >
            <Pencil size={10} />
            Edit
        </button>
    );
}

function EditProfileModal({ isOpen, initialTab, onClose, username, authProvider, onSaveUsername, onSavePassword }) {
    const canEditPassword = authProvider === "LOCAL";
    const [activeTab, setActiveTab] = useState(initialTab || "username");
    const [usernameDraft, setUsernameDraft] = useState(username);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab(canEditPassword ? (initialTab || "username") : "username");
        setUsernameDraft(username);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");
    }, [isOpen, initialTab, username, canEditPassword]);

    const isPasswordView = canEditPassword && activeTab === "password";

    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const inputStyle =
        "w-full rounded-lg border border-[#E7E9EF] bg-white px-2.5 py-1.5 text-[13px] text-[#14171F] outline-none transition-colors focus:border-[#2647D6] focus:ring-2 focus:ring-[#2647D6]/15 dark:border-[#262B36] dark:bg-[#161A22] dark:text-[#F3F4F7]";
    const labelStyle =
        "text-[10px] font-semibold uppercase tracking-wider text-[#8A93A3] dark:text-[#6B7280]";
    const tabBase =
        "flex-1 rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";
    const tabActive = "bg-white text-[#14171F] shadow-sm dark:bg-[#12151C] dark:text-[#F3F4F7]";
    const tabInactive = "text-[#8A93A3] hover:text-[#14171F] dark:text-[#6B7280] dark:hover:text-[#F3F4F7]";

    const handleUsernameSave = () => {
        if (!usernameDraft.trim()) return;
        onSaveUsername?.(usernameDraft.trim());
        onClose();
    };

    const handlePasswordSave = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords don't match.");
            return;
        }
        onSavePassword?.({ currentPassword, newPassword });
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-[#12151C]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-profile-title"
            >
                <div className="flex items-center justify-between border-b border-[#E7E9EF] px-4 py-3 dark:border-[#262B36]">
                    <h3
                        id="edit-profile-title"
                        className="text-[14px] font-semibold text-[#14171F] dark:text-[#F3F4F7]"
                    >
                        Edit profile
                    </h3>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-[#8A93A3] transition-colors hover:bg-[#F7F8FA] hover:text-[#14171F] dark:hover:bg-[#1A1E27] dark:hover:text-[#F3F4F7]"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className="px-4 pt-3">
                    <div className="inline-flex w-full rounded-lg bg-[#F7F8FA] p-1 dark:bg-[#161A22]">
                        <button
                            onClick={() => {
                                setActiveTab("username");
                                setPasswordError("");
                            }}
                            className={`${tabBase} ${activeTab === "username" ? tabActive : tabInactive}`}
                        >
                            Username
                        </button>
                        <button
                            disabled={!canEditPassword}
                            title={!canEditPassword ? `Managed by ${authProvider === "GOOGLE" ? "Google" : "GitHub"}` : undefined}
                            onClick={() => {
                                setActiveTab("password");
                                setPasswordError("");
                            }}
                            className={`${tabBase} ${isPasswordView ? tabActive : tabInactive}`}
                        >
                            Password
                        </button>
                    </div>
                </div>

                <div className="px-4 py-4">
                    {!isPasswordView ? (
                        <div className="flex flex-col gap-1.5">
                            <label className={labelStyle} htmlFor="username-input">Username</label>
                            <input
                                id="username-input"
                                value={usernameDraft}
                                onChange={(e) => setUsernameDraft(e.target.value)}
                                className={inputStyle}
                                autoFocus
                            />
                            <p className="text-[11px] text-[#8A93A3] dark:text-[#6B7280]">
                                Shown across PrepEdge.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className={labelStyle} htmlFor="current-password">Current password</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={inputStyle}
                                    autoFocus
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelStyle} htmlFor="new-password">New password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className={labelStyle} htmlFor="confirm-password">Confirm new password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputStyle}
                                />
                            </div>
                            {passwordError && (
                                <p className="text-[11px] font-medium text-red-500">{passwordError}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#E7E9EF] px-4 py-3 dark:border-[#262B36]">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-3.5 py-1.5 text-[12px] font-medium text-[#5B6472] transition-colors hover:bg-[#F7F8FA] dark:text-[#A7AFBD] dark:hover:bg-[#1A1E27]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isPasswordView ? handlePasswordSave : handleUsernameSave}
                        className="rounded-lg bg-[#2647D6] px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-[#1D3AB8]"
                    >
                        Save changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProfileOverviewCard({
                                                username = "vectorio",
                                                initials = "V",
                                                avatarUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
                                                imgError = false,
                                                setImgError = () => {},
                                                uploadingAvatar = false,
                                                avatarError = "",
                                                handleAvatarChange = () => {},
                                                profile = { email: "iamvectorio@gmail.com", authProvider: "GOOGLE" },
                                                experienceLabel = "Student / Fresher",
                                                targetLabel = "FAANG / Big Tech",
                                                formattedDate = "July 1, 2026",
                                                openEdit = () => {},
                                            }) {
    const fileInputRef = useRef(null);
    const isLocalAuth = profile?.authProvider === "LOCAL";

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editTab, setEditTab] = useState("username");

    const openEditModal = (tab) => {
        setEditTab(tab);
        setIsEditOpen(true);
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-[#E7E9EF] bg-white shadow-[0_1px_2px_rgba(20,23,31,0.04)] dark:border-[#262B36] dark:bg-[#12151C]">

            {/* Identity band */}
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
                <div className="relative shrink-0">
                    <div className="h-14 w-14 overflow-hidden rounded-full shadow-[0_2px_8px_-2px_rgba(20,23,31,0.15)] ring-1 ring-black/5">
                        {avatarUrl && !imgError ? (
                            <img
                                src={avatarUrl}
                                alt={`${username}'s avatar`}
                                onError={() => setImgError(true)}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#2647D6] text-base font-semibold text-white">
                                {initials}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        aria-label="Change profile photo"
                        title="Change profile photo"
                        className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#2647D6] text-white ring-2 ring-white transition-colors hover:bg-[#1D3AB8] disabled:opacity-60 dark:ring-[#12151C]"
                    >
                        <Camera size={10} />
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        aria-label="Upload profile photo"
                    />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-[17px] font-semibold leading-tight tracking-tight text-[#14171F] dark:text-[#F3F4F7]">
                            {username || "User"}
                        </h2>
                        {experienceLabel && (
                            <span className="shrink-0 rounded-full bg-[#EEF1FE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2647D6] dark:bg-[#1B2340] dark:text-[#7C97FF]">
                                {experienceLabel}
                            </span>
                        )}
                        <EditAction onClick={() => openEditModal("username")} label="Edit username" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#5B6472] dark:text-[#A7AFBD]">
                        <span className="inline-flex items-center gap-1" title={profile?.email}>
                            <Mail size={12} className="shrink-0 text-[#8A93A3]" />
                            <span className="max-w-[200px] truncate">{profile?.email}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF7F1] px-1.5 py-0.5 text-[10px] font-medium text-[#157F5C] dark:bg-[#0E2A21] dark:text-[#3FBF8F]">
                            <ShieldCheck size={10} />
                            Verified
                        </span>
                    </div>

                    {uploadingAvatar && (
                        <p className="text-[10px] font-medium text-[#2647D6] dark:text-[#7C97FF]">Uploading…</p>
                    )}
                    {avatarError && (
                        <p className="text-[10px] font-medium text-red-500">{avatarError}</p>
                    )}
                </div>
            </div>

            {/* Prep config band — display only */}
            <div className="grid grid-cols-1 gap-4 border-t border-[#E7E9EF] p-4 sm:grid-cols-2 sm:p-5 dark:border-[#262B36]">
                <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A93A3] dark:text-[#6B7280]">
                        <Briefcase size={11} />
                        Target Company
                    </span>
                    <span className="truncate text-[13px] font-medium text-[#14171F] dark:text-[#F3F4F7]">
                        {targetLabel || "Not set"}
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A93A3] dark:text-[#6B7280]">
                        <Calendar size={11} />
                        Interview Date
                    </span>
                    <span className="truncate text-[13px] font-medium text-[#14171F] dark:text-[#F3F4F7]">
                        {formattedDate || "Not set"}
                    </span>
                </div>
            </div>

            {/* Account security band */}
            <div className="flex items-center justify-between gap-3 border-t border-[#E7E9EF] bg-[#F7F8FA] px-4 py-3 sm:px-5 dark:border-[#262B36] dark:bg-[#161A22]">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#5B6472] dark:text-[#A7AFBD]">
                    <Lock size={12} className="shrink-0 text-[#8A93A3]" />
                    {isLocalAuth
                        ? "Password"
                        : `Signed in with ${profile?.authProvider === "GOOGLE" ? "Google" : "GitHub"}`}
                </span>
                {isLocalAuth && <EditAction onClick={() => openEditModal("password")} label="Change password" />}
            </div>

            <EditProfileModal
                isOpen={isEditOpen}
                initialTab={editTab}
                onClose={() => setIsEditOpen(false)}
                username={username}
                authProvider={profile?.authProvider}
                onSaveUsername={(val) => openEdit("username", { username: val })}
                onSavePassword={(payload) => openEdit("password", payload)}
            />
        </div>
    );
}