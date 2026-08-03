import { useRef } from "react";
import { Camera, Mail, ShieldCheck, Pencil, Lock, Briefcase, Calendar } from "lucide-react";

function EditAction({ onClick, label }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className="inline-flex shrink-0 items-center gap-1 rounded text-[11px] font-medium text-[#8A93A3] transition-colors hover:text-[#2647D6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2647D6] dark:text-[#6B7280] dark:hover:text-[#7C97FF]"
        >
            <Pencil size={10} />
            Edit
        </button>
    );
}

export default function ProfileOverviewCard({
                                                username = "",
                                                initials = "U",
                                                avatarUrl = "",
                                                imgError = false,
                                                setImgError = () => {},
                                                uploadingAvatar = false,
                                                avatarError = "",
                                                handleAvatarChange = () => {},
                                                profile = {},
                                                experienceLabel = null,
                                                targetLabel = null,
                                                formattedDate = null,
                                                openEdit = () => {},
                                            }) {
    const fileInputRef = useRef(null);
    const isLocalAuth = profile?.authProvider === "LOCAL";

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
                        <EditAction onClick={() => openEdit("username")} label="Edit username" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#5B6472] dark:text-[#A7AFBD]">
                        <span className="inline-flex items-center gap-1" title={profile?.email}>
                            <Mail size={12} className="shrink-0 text-[#8A93A3]" />
                            <span className="max-w-50 truncate">{profile?.email}</span>
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

            {/* Prep config band */}
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
                    {profile?.authProvider
                        ? isLocalAuth
                            ? "Password"
                            : `Signed in with ${profile.authProvider === "GOOGLE" ? "Google" : "GitHub"}`
                        : ""}
                </span>
                {isLocalAuth && <EditAction onClick={() => openEdit("password")} label="Change password" />}
            </div>
        </div>
    );
}
