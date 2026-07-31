import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import ProfileOverviewCard from "../components/profile/ProfileOverviewCard";
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileModal from "../components/profile/EditProfileModal";
import ActivityHeatmap from "../components/profile/ActivityHeatmap";
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
    <div className="min-h-screen bg-indigo-50 transition-colors duration-200 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <Sidebar
            username={username}
            targetLabel={targetLabel}
            experienceLabel={experienceLabel}
            daysLeft={daysLeft}
        />

        <div className="min-w-0 flex-1 space-y-6">
          <ProfileHeader />

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

      <EditProfileModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          editType={editType}
          error={error}
          success={success}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newDate={newDate}
          setNewDate={setNewDate}
          currentPwd={currentPwd}
          setCurrentPwd={setCurrentPwd}
          newPwd={newPwd}
          setNewPwd={setNewPwd}
          confirmPwd={confirmPwd}
          setConfirmPwd={setConfirmPwd}
          showPwd={showPwd}
          setShowPwd={setShowPwd}
          handleSave={handleSave}
          saving={saving}
          username={username}
      />
    </div>
  );
}
