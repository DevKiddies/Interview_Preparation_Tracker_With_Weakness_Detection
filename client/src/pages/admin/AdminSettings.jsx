// AdminSettings.jsx — Settings page for platform-wide admin configuration.
// Sections: Platform, Test Settings, User Accounts, Notifications, Security, Danger Zone.
// All state is local (frontend-only); wire each section's save handler to the backend API.

import { useState } from "react";
import {
  Settings, Monitor, ClipboardList, Users, Bell, Shield,
  AlertTriangle, CheckCircle, Save, Download, Trash2, RefreshCw,
  Eye, EyeOff, Info,
} from "lucide-react";

// ── Reusable small components ─────────────────────────────────────────────────

function Toggle({ value, onChange, label, desc, disabled = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onChange}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${value ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span className={`absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function Field({ label, desc, error, children }) {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-slate-800 dark:text-white mb-1">{label}</label>
      {desc && <p className="text-xs text-slate-400 mb-2">{desc}</p>}
      {children}
      {error && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1"><Info size={11} />{error}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", min, max, placeholder, className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map(({ label, value: v }) => <option key={v} value={v}>{label}</option>)}
    </select>
  );
}

function SectionCard({ children, title, icon: Icon, accent = "blue", onSave, saved }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className={`flex items-center gap-2 px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-${accent}-50/50 dark:bg-${accent}-900/10`}>
        <Icon size={16} className={`text-${accent}-500`} />
        <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{title}</h3>
      </div>
      <div className="px-5 divide-y divide-slate-100 dark:divide-slate-700">
        {children}
      </div>
      {onSave && (
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
              <CheckCircle size={13} /> Saved
            </span>
          )}
          <button
            onClick={onSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ title, message, warning, confirmLabel = "Confirm", danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className={`flex justify-center mb-4`}>
            <div className={`p-3 rounded-full ${danger ? "bg-rose-100 dark:bg-rose-900/30" : "bg-amber-100 dark:bg-amber-900/30"}`}>
              <AlertTriangle size={24} className={danger ? "text-rose-500" : "text-amber-500"} />
            </div>
          </div>
          <h2 className="text-center font-bold text-slate-900 dark:text-white text-lg">{title}</h2>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">{message}</p>
          {warning && (
            <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center">{warning}</p>
            </div>
          )}
          <div className="flex gap-2 mt-5">
            <button onClick={onConfirm} className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600"}`}>{confirmLabel}</button>
            <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: "platform",      label: "Platform",       icon: Monitor       },
  { id: "tests",         label: "Test Settings",  icon: ClipboardList },
  { id: "users",         label: "User Accounts",  icon: Users         },
  { id: "notifications", label: "Notifications",  icon: Bell          },
  { id: "security",      label: "Security",       icon: Shield        },
  { id: "danger",        label: "Danger Zone",    icon: AlertTriangle },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("platform");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // null | 'resetStats' | 'clearTests' | 'exportData'
  const [saved, setSaved] = useState({});

  // ── Section state ─────────────────────────────────────────────────────────

  const [platform, setPlatform] = useState({
    name: "PrepEdge",
    tagline: "Interview Preparation with Weakness Detection",
    supportEmail: "support@prepedge.com",
    publicRegistration: true,
    maintenanceMode: false,
  });

  const [testCfg, setTestCfg] = useState({
    defaultQuestionCount: 20,
    defaultTimeLimitMinutes: 30,
    passThreshold: 60,
    allowRetakes: true,
    shuffleByDefault: true,
    maxRetakesPerDay: 3,
  });

  const [userCfg, setUserCfg] = useState({
    requireEmailVerification: true,
    sessionTimeout: "24h",
    maxFailedLogins: 5,
    lockoutDurationMinutes: 30,
    autoBanAfterReports: 3,
    allowProfileEdit: true,
  });

  const [notifCfg, setNotifCfg] = useState({
    sendWelcomeEmail: true,
    weeklyProgressReport: false,
    adminNewSignupAlert: false,
    adminBanAlert: true,
    adminWeaknessDigest: true,
  });

  const [secCfg, setSecCfg] = useState({
    jwtExpiry: "7d",
    requireAdminMFA: false,
    minPasswordLength: 8,
    requireSpecialChar: true,
    requireUppercase: true,
    showPasswordStrength: true,
  });

  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  // ── Helpers ───────────────────────────────────────────────────────────────

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (section) => {
    setSaved(s => ({ ...s, [section]: true }));
    showToast(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`);
    setTimeout(() => setSaved(s => ({ ...s, [section]: false })), 2500);
  };

  const handleDangerAction = (action) => {
    setModal(null);
    if (action === "exportData") {
      showToast("Data export started — you'll receive an email shortly");
    } else if (action === "resetStats") {
      showToast("Platform statistics have been reset", "warning");
    } else if (action === "clearTests") {
      showToast("All test history cleared", "warning");
    }
  };

  // ── Tab content renderers ─────────────────────────────────────────────────

  const renderPlatform = () => (
    <SectionCard title="Platform Configuration" icon={Monitor} accent="blue" onSave={() => handleSave("platform")} saved={saved.platform}>
      <Field label="Platform Name" desc="Displayed in the browser title and header">
        <Input value={platform.name} onChange={e => setPlatform(p => ({ ...p, name: e.target.value }))} placeholder="PrepEdge" />
      </Field>
      <Field label="Tagline" desc="Short description shown on the landing page">
        <Input value={platform.tagline} onChange={e => setPlatform(p => ({ ...p, tagline: e.target.value }))} />
      </Field>
      <Field label="Support Email" desc="Users can contact this address for help">
        <Input type="email" value={platform.supportEmail} onChange={e => setPlatform(p => ({ ...p, supportEmail: e.target.value }))} />
      </Field>
      <Toggle
        label="Public Registration"
        desc="Allow anyone to sign up. Disable to restrict access to invited users only."
        value={platform.publicRegistration}
        onChange={() => setPlatform(p => ({ ...p, publicRegistration: !p.publicRegistration }))}
      />
      <Toggle
        label="Maintenance Mode"
        desc="When enabled, the platform shows a maintenance notice to all non-admin users."
        value={platform.maintenanceMode}
        onChange={() => setPlatform(p => ({ ...p, maintenanceMode: !p.maintenanceMode }))}
      />
      {platform.maintenanceMode && (
        <div className="py-2">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
            <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">Maintenance mode is ON. Users will see a maintenance page until you disable this.</p>
          </div>
        </div>
      )}
    </SectionCard>
  );

  const renderTests = () => (
    <SectionCard title="Test Settings" icon={ClipboardList} accent="indigo" onSave={() => handleSave("tests")} saved={saved.tests}>
      <div className="py-3 grid grid-cols-2 gap-4">
        <Field label="Default Questions" desc="Per test session (5–50)">
          <Input type="number" value={testCfg.defaultQuestionCount} min={5} max={50} onChange={e => setTestCfg(t => ({ ...t, defaultQuestionCount: Number(e.target.value) }))} />
        </Field>
        <Field label="Default Time Limit" desc="Minutes per test (5–120)">
          <Input type="number" value={testCfg.defaultTimeLimitMinutes} min={5} max={120} onChange={e => setTestCfg(t => ({ ...t, defaultTimeLimitMinutes: Number(e.target.value) }))} />
        </Field>
      </div>
      <Field label="Pass Threshold (%)" desc="Minimum accuracy a user needs to 'pass' a test (1–100)">
        <div className="flex items-center gap-3">
          <Input type="number" value={testCfg.passThreshold} min={1} max={100} className="max-w-30" onChange={e => setTestCfg(t => ({ ...t, passThreshold: Number(e.target.value) }))} />
          <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700">
            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${testCfg.passThreshold}%` }} />
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 w-10 text-right">{testCfg.passThreshold}%</span>
        </div>
      </Field>
      <Toggle
        label="Shuffle Questions by Default"
        desc="Randomize question order for each test attempt."
        value={testCfg.shuffleByDefault}
        onChange={() => setTestCfg(t => ({ ...t, shuffleByDefault: !t.shuffleByDefault }))}
      />
      <Toggle
        label="Allow Test Retakes"
        desc="Let users retake the same test multiple times."
        value={testCfg.allowRetakes}
        onChange={() => setTestCfg(t => ({ ...t, allowRetakes: !t.allowRetakes }))}
      />
      {testCfg.allowRetakes && (
        <Field label="Max Retakes Per Day" desc="Maximum number of times a user can retake one test in a single day">
          <Input type="number" value={testCfg.maxRetakesPerDay} min={1} max={20} className="max-w-30" onChange={e => setTestCfg(t => ({ ...t, maxRetakesPerDay: Number(e.target.value) }))} />
        </Field>
      )}
    </SectionCard>
  );

  const renderUsers = () => (
    <SectionCard title="User Account Settings" icon={Users} accent="teal" onSave={() => handleSave("users")} saved={saved.users}>
      <Toggle
        label="Require Email Verification"
        desc="New accounts must verify their email address before accessing the platform."
        value={userCfg.requireEmailVerification}
        onChange={() => setUserCfg(u => ({ ...u, requireEmailVerification: !u.requireEmailVerification }))}
      />
      <Toggle
        label="Allow Profile Editing"
        desc="Let users update their name, avatar, and onboarding preferences."
        value={userCfg.allowProfileEdit}
        onChange={() => setUserCfg(u => ({ ...u, allowProfileEdit: !u.allowProfileEdit }))}
      />
      <Field label="Session Timeout" desc="How long before an inactive user is automatically logged out">
        <Select
          value={userCfg.sessionTimeout}
          onChange={e => setUserCfg(u => ({ ...u, sessionTimeout: e.target.value }))}
          options={[
            { label: "1 Hour",   value: "1h"  },
            { label: "6 Hours",  value: "6h"  },
            { label: "24 Hours", value: "24h" },
            { label: "7 Days",   value: "7d"  },
          ]}
        />
      </Field>
      <div className="py-3 grid grid-cols-2 gap-4">
        <Field label="Max Failed Login Attempts" desc="Before account lockout">
          <Input type="number" value={userCfg.maxFailedLogins} min={1} max={20} onChange={e => setUserCfg(u => ({ ...u, maxFailedLogins: Number(e.target.value) }))} />
        </Field>
        <Field label="Lockout Duration (min)" desc="Minutes the account stays locked">
          <Input type="number" value={userCfg.lockoutDurationMinutes} min={1} max={1440} onChange={e => setUserCfg(u => ({ ...u, lockoutDurationMinutes: Number(e.target.value) }))} />
        </Field>
      </div>
      <Field label="Auto-Ban After Reports" desc="Automatically ban a user after receiving this many reports from others">
        <Input type="number" value={userCfg.autoBanAfterReports} min={1} max={50} className="max-w-30" onChange={e => setUserCfg(u => ({ ...u, autoBanAfterReports: Number(e.target.value) }))} />
      </Field>
    </SectionCard>
  );

  const renderNotifications = () => (
    <SectionCard title="Notification Settings" icon={Bell} accent="amber" onSave={() => handleSave("notifications")} saved={saved.notifications}>
      <div className="py-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">User Emails</p>
      </div>
      <Toggle
        label="Welcome Email"
        desc="Send a welcome email to new users after sign-up."
        value={notifCfg.sendWelcomeEmail}
        onChange={() => setNotifCfg(n => ({ ...n, sendWelcomeEmail: !n.sendWelcomeEmail }))}
      />
      <Toggle
        label="Weekly Progress Report"
        desc="Send users a weekly summary of their test performance and improvements."
        value={notifCfg.weeklyProgressReport}
        onChange={() => setNotifCfg(n => ({ ...n, weeklyProgressReport: !n.weeklyProgressReport }))}
      />
      <div className="py-2 pt-4">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Admin Alerts</p>
      </div>
      <Toggle
        label="New Sign-up Alert"
        desc="Notify admins when a new user registers on the platform."
        value={notifCfg.adminNewSignupAlert}
        onChange={() => setNotifCfg(n => ({ ...n, adminNewSignupAlert: !n.adminNewSignupAlert }))}
      />
      <Toggle
        label="Ban/Report Alert"
        desc="Notify admins when a user receives a report or is auto-banned."
        value={notifCfg.adminBanAlert}
        onChange={() => setNotifCfg(n => ({ ...n, adminBanAlert: !n.adminBanAlert }))}
      />
      <Toggle
        label="Weekly Weakness Digest"
        desc="Send admins a weekly report of the platform's top weakness categories."
        value={notifCfg.adminWeaknessDigest}
        onChange={() => setNotifCfg(n => ({ ...n, adminWeaknessDigest: !n.adminWeaknessDigest }))}
      />
    </SectionCard>
  );

  const renderSecurity = () => (
    <SectionCard title="Security Settings" icon={Shield} accent="purple" onSave={() => handleSave("security")} saved={saved.security}>
      <Field label="JWT Expiry" desc="How long an authentication token remains valid">
        <Select
          value={secCfg.jwtExpiry}
          onChange={e => setSecCfg(s => ({ ...s, jwtExpiry: e.target.value }))}
          options={[
            { label: "1 Hour",   value: "1h"  },
            { label: "6 Hours",  value: "6h"  },
            { label: "1 Day",    value: "1d"  },
            { label: "7 Days",   value: "7d"  },
            { label: "30 Days",  value: "30d" },
          ]}
        />
      </Field>
      <Toggle
        label="Require Admin MFA"
        desc="Force admin accounts to use multi-factor authentication on every login."
        value={secCfg.requireAdminMFA}
        onChange={() => setSecCfg(s => ({ ...s, requireAdminMFA: !s.requireAdminMFA }))}
      />
      <Toggle
        label="Show Password Strength Meter"
        desc="Display a real-time password strength indicator on sign-up and password change forms."
        value={secCfg.showPasswordStrength}
        onChange={() => setSecCfg(s => ({ ...s, showPasswordStrength: !s.showPasswordStrength }))}
      />
      <div className="py-3">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Password Policy</p>
        <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
          <Field label="Minimum Password Length" desc="">
            <Input type="number" value={secCfg.minPasswordLength} min={6} max={32} className="max-w-30" onChange={e => setSecCfg(s => ({ ...s, minPasswordLength: Number(e.target.value) }))} />
          </Field>
          <Toggle
            label="Require Uppercase Letter"
            desc="Password must contain at least one uppercase character."
            value={secCfg.requireUppercase}
            onChange={() => setSecCfg(s => ({ ...s, requireUppercase: !s.requireUppercase }))}
          />
          <Toggle
            label="Require Special Character"
            desc="Password must include at least one symbol (e.g. !, @, #)."
            value={secCfg.requireSpecialChar}
            onChange={() => setSecCfg(s => ({ ...s, requireSpecialChar: !s.requireSpecialChar }))}
          />
        </div>
      </div>
      <Field label="Change Admin Password" desc="Leave blank to keep the current password">
        <div className="relative max-w-xs">
          <input
            type={showAdminPass ? "text" : "password"}
            value={adminPass}
            onChange={e => setAdminPass(e.target.value)}
            placeholder="New admin password…"
            className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="button" onClick={() => setShowAdminPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showAdminPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {adminPass && (
          <div className="flex gap-1.5 mt-2">
            {[
              adminPass.length >= secCfg.minPasswordLength,
              secCfg.requireUppercase ? /[A-Z]/.test(adminPass) : true,
              secCfg.requireSpecialChar ? /[^a-zA-Z0-9]/.test(adminPass) : true,
            ].map((ok, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${ok ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"}`} />
            ))}
          </div>
        )}
      </Field>
    </SectionCard>
  );

  const renderDanger = () => (
    <div className="space-y-4">
      <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Danger Zone</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">Actions here are irreversible. Please read each warning carefully before proceeding.</p>
        </div>
      </div>

      {[
        {
          id: "exportData",
          icon: Download,
          title: "Export All Platform Data",
          desc: "Download a full backup of all users, questions, test configs, and attempt logs as a JSON file.",
          btnLabel: "Export Data",
          btnClass: "border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
          danger: false,
        },
        {
          id: "resetStats",
          icon: RefreshCw,
          title: "Reset Platform Statistics",
          desc: "Clear all aggregated analytics data (attempt counts, pass rates, accuracy averages). Raw test data is preserved.",
          btnLabel: "Reset Stats",
          btnClass: "border-amber-300 dark:border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
          danger: false,
        },
        {
          id: "clearTests",
          icon: Trash2,
          title: "Clear All Test History",
          desc: "Permanently delete all test attempt records. User accounts and questions are not affected.",
          btnLabel: "Clear History",
          btnClass: "border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20",
          danger: true,
        },
      ].map(({ id, icon: Icon, title, desc, btnLabel, btnClass, danger }) => (
        <div key={id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={15} className={danger ? "text-rose-500" : "text-amber-500"} />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
          <button
            onClick={() => setModal(id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${btnClass}`}
          >
            {btnLabel}
          </button>
        </div>
      ))}
    </div>
  );

  const RENDERERS = {
    platform:      renderPlatform,
    tests:         renderTests,
    users:         renderUsers,
    notifications: renderNotifications,
    security:      renderSecurity,
    danger:        renderDanger,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-blue-500" size={26} /> Admin Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure platform behaviour, security policies, and notification preferences.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
              activeTab === id
                ? id === "danger"
                  ? "bg-rose-600 text-white"
                  : "bg-blue-600 text-white"
                : id === "danger"
                  ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Active section */}
      <div>
        {RENDERERS[activeTab]?.()}
      </div>

      {/* Confirm Modals */}
      {modal === "exportData" && (
        <ConfirmModal
          title="Export All Data?"
          message="A full platform backup will be prepared and sent to the admin email address."
          confirmLabel="Start Export"
          danger={false}
          onConfirm={() => handleDangerAction("exportData")}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "resetStats" && (
        <ConfirmModal
          title="Reset Platform Statistics?"
          message="All aggregated analytics will be cleared and reset to zero."
          warning="Attempt counts, pass rates, and accuracy averages will be lost permanently."
          confirmLabel="Reset Stats"
          danger={false}
          onConfirm={() => handleDangerAction("resetStats")}
          onCancel={() => setModal(null)}
        />
      )}
      {modal === "clearTests" && (
        <ConfirmModal
          title="Delete All Test History?"
          message="Every test attempt record on the platform will be permanently deleted."
          warning="This cannot be undone. User accounts and the question bank are not affected."
          confirmLabel="Delete All History"
          danger={true}
          onConfirm={() => handleDangerAction("clearTests")}
          onCancel={() => setModal(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white transition-all ${toast.type === "warning" ? "bg-amber-500" : "bg-green-500"}`}>
          <CheckCircle size={15} /> {toast.msg}
        </div>
      )}
    </div>
  );
}
