import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ProfileOverviewCard from "../components/profile/ProfileOverviewCard";
import ActivityHeatmap from "../components/dashboard/ActivityHeatmap";
import { X, Eye, EyeOff } from "lucide-react";
import API_BASE from "../utils/api.js";

const TARGET_LABELS = {
  faang: "FAANG / Big Tech",
  product: "Product Companies",
  service: "Service Companies",
  competitive: "Competitive Exams",
};

const EXPERIENCE_LABELS = {
  fresher: "Student / Fresher",
  mid: "Mid-level",
  senior: "Senior",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile]     = useState(null);
  const [username, setUsername]   = useState(localStorage.getItem("username") || "");
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatarUrl") || "");
  const [imgError, setImgError]   = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Modal forms state
  const [showModal, setShowModal]     = useState(false);
  const [editType, setEditType]       = useState("username");
  const [newUsername, setNewUsername] = useState("");
  const [newDate, setNewDate]         = useState("");
  const [currentPwd, setCurrentPwd]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((r) => r.json())
        .then((data) => {
          setProfile(data);
          if (data.username) {
            setUsername(data.username);
            localStorage.setItem("username", data.username);
          }
          if (data.avatarUrl) localStorage.setItem("avatarUrl", data.avatarUrl);
        })
        .catch(() => {});
  }, [navigate]);

  const initials = username ? username.slice(0, 2).toUpperCase() : "U";
  const targetLabel = TARGET_LABELS[profile?.targetCompany] ?? null;
  const experienceLabel = EXPERIENCE_LABELS[profile?.experienceLevel] ?? null;

  const formattedDate = profile?.interviewDate
      ? new Date(profile.interviewDate).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
      : null;

  const daysLeft = profile?.interviewDate
      ? Math.max(0, Math.ceil((new Date(profile.interviewDate) - new Date()) / 86400000))
      : null;

  const openEdit = (type) => {
    setEditType(type);
    setNewUsername("");
    setNewDate(profile?.interviewDate ?? "");
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setError(""); setSuccess("");
    setShowModal(true);
  };

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

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5 MB.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token || !profile?.id) return;

    setAvatarError("");
    setUploadingAvatar(true);
    try {
      const dataUrl = await compressImage(file);
      const res = await fetch(`${API_BASE}/api/users/${profile.id}/avatar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl: dataUrl }),
      });
      if (res.ok) {
        setAvatarUrl(dataUrl);
        setImgError(false);
        localStorage.setItem("avatarUrl", dataUrl);
        window.dispatchEvent(new CustomEvent("user-profile-updated"));
      } else {
        const msg = await res.text();
        setAvatarError(msg || "Failed to update photo.");
      }
    } catch {
      setAvatarError("Network error. Please try again.");
    }
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setError(""); setSuccess(""); setSaving(true);

    try {
      if (editType === "username") {
        if (!newUsername.trim()) { setError("Username cannot be empty."); setSaving(false); return; }
        const res = await fetch(`${API_BASE}/api/users/${profile.id}/username`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ newUsername: newUsername.trim() }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setError(msg || "Failed to update username.");
        } else {
          const updated = await res.json();
          setUsername(updated.username);
          localStorage.setItem("username", updated.username);
          setProfile((p) => ({ ...p, username: updated.username }));
          setSuccess("Username updated!");
          window.dispatchEvent(new CustomEvent("user-profile-updated"));
        }
      } else if (editType === "interviewDate") {
        if (!newDate) { setError("Please select a date."); setSaving(false); return; }
        const res = await fetch(`${API_BASE}/api/users/${profile.id}/interview-date`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ interviewDate: newDate }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setError(msg || "Failed to update interview date.");
        } else {
          const updated = await res.json();
          setProfile((p) => ({ ...p, interviewDate: updated.interviewDate }));
          setSuccess("Interview date updated!");
          window.dispatchEvent(new CustomEvent("user-profile-updated"));
        }
      } else {
        if (!currentPwd || !newPwd) { setError("All fields are required."); setSaving(false); return; }
        if (newPwd !== confirmPwd)  { setError("New passwords do not match."); setSaving(false); return; }
        const res = await fetch(`${API_BASE}/api/users/${profile.id}/password`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ oldPassword: currentPwd, newPassword: newPwd }),
        });
        if (!res.ok) {
          const msg = await res.text();
          setError(msg || "Failed to update password.");
        } else {
          setSuccess("Password updated!");
        }
      }
    } catch { setError("Network error. Please try again."); }
    setSaving(false);
  };

  return (
      /* Matched exact background color and container paddings */
      <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
          <Sidebar
              username={username}
              targetLabel={targetLabel}
              experienceLabel={experienceLabel}
              daysLeft={daysLeft}
          />

          <div className="min-w-0 flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                My Profile
              </h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                Manage your account and preferences
              </p>
            </div>

            <div className="w-full space-y-6">
              <ProfileOverviewCard
                  username={username}
                  initials={initials}
                  avatarUrl={avatarUrl}
                  imgError={imgError}
                  setImgError={setImgError}
                  uploadingAvatar={uploadingAvatar}
                  avatarError={avatarError}
                  handleAvatarChange={handleAvatarChange}
                  profile={profile}
                  experienceLabel={experienceLabel}
                  targetLabel={targetLabel}
                  formattedDate={formattedDate}
                  openEdit={openEdit}
              />

              <ActivityHeatmap />
            </div>
          </div>
        </div>

        {showModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
            >
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editType === "username"
                        ? "Change Username"
                        : editType === "interviewDate"
                            ? "Change Interview Date"
                            : "Change Password"}
                  </h3>
                  <button
                      onClick={() => setShowModal(false)}
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

                {editType === "username" ? (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                        New Username
                      </label>
                      <input
                          type="text"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          placeholder={username}
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      />
                    </div>
                ) : editType === "interviewDate" ? (
                    <div className="mb-4">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Interview Date
                      </label>
                      <input
                          type="date"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:scheme-dark"
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
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
        )}
      </div>
  );
}