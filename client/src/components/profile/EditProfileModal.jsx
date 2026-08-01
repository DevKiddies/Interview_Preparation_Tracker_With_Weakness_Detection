import { X, Eye, EyeOff } from "lucide-react";

export default function EditProfileModal({
  isOpen,
  onClose,
  editType,
  error,
  success,
  newUsername,
  setNewUsername,
  newDate,
  setNewDate,
  currentPwd,
  setCurrentPwd,
  newPwd,
  setNewPwd,
  confirmPwd,
  setConfirmPwd,
  showPwd,
  setShowPwd,
  handleSave,
  saving,
  username,
}) {
  if (!isOpen) return null;

  const isUsername = editType === "username";
  const isDate = editType === "interviewDate";
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isUsername
              ? "Change Username"
              : isDate
                ? "Change Interview Date"
                : "Change Password"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-3 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:bg-green-500/10 dark:text-green-400">
            {success}
          </div>
        )}

        {isUsername ? (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              New Username
            </label>
            <input
              type="text"
              className={inputClass}
              placeholder={username}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        ) : isDate ? (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Interview Date
            </label>
            <input
              type="date"
              className={`${inputClass} dark:scheme-dark`}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              Select your target interview date. This updates your dashboard countdown.
            </p>
          </div>
        ) : (
          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Current Password
              </label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Min 8 chars with uppercase, lowercase, number &amp; special char
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Confirm New Password
              </label>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving\u2026" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
