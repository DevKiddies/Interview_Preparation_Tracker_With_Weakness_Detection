// HeroSection.jsx — landing page hero with a typewriter animation that cycles
// through motivational phrases and context-aware CTA buttons (different for
// logged-in vs guest users).

import { BarChart2, CheckCircle2, Target, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE from '../utils/api.js'

const WORDS = ['dream job.', 'top offer.', 'FAANG role.', 'six figures.', 'your goals.']
// Typewriter timing constants — adjust these if the animation feels too fast/slow.
const TYPE_SPEED = 100   // ms per character while typing
const DELETE_SPEED = 50  // ms per character while deleting (faster feels snappier)
const PAUSE_MS = 1800    // how long the fully typed word stays visible before deleting

// Mirrors the labels DashboardPage shows for the same onboarding field.
const TARGET_LABELS = {
  faang: 'FAANG / Big Tech',
  product: 'Product Companies',
  service: 'Service Companies',
  competitive: 'Competitive Exams',
}

export default function HeroSection() {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'))
  const [stats, setStats] = useState({ totalUsers: null, totalQuestions: null })
  const [profile, setProfile] = useState(null)
  const [latestTest, setLatestTest] = useState(null)
  const [username] = useState(() => localStorage.getItem('username') || '')
  const navigate = useNavigate()

  // .then()-chained rather than async/await so the setState call is visibly
  // nested inside a promise callback, not the effect body itself.
  useEffect(() => {
    fetch(`${API_BASE}/api/public/stats`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats({ totalUsers: data.totalUsers, totalQuestions: data.totalQuestions })
      })
      .catch(() => {
        // silent — the hero just keeps showing the "—" placeholder
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProfile(data)
      })
      .catch(() => {
        // silent — the goal card just falls back to the "set a goal" prompt
      })
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${API_BASE}/api/tests/latest`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setLatestTest(data)
      })
      .catch(() => {
        // silent — the result card just falls back to the "take a test" prompt
      })
  }, [])

  const formatStat = (n) => (n === null ? '—' : n.toLocaleString('en-US'))

  // Whole days remaining until the interview date — same calculation as DashboardPage.
  const daysLeft = (() => {
    if (!profile?.interviewDate) return null
    const target = new Date(profile.interviewDate)
    const today = new Date()
    target.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24))
    return diff >= 0 ? diff : 0
  })()

  const targetLabel = TARGET_LABELS[profile?.targetCompany] ?? null
  const hasGoal = daysLeft !== null

  // More filled dots the closer the interview gets — an honest urgency gauge
  // instead of a fixed "3 of 5" placeholder.
  const urgencyDots = hasGoal ? Math.max(1, Math.min(5, 5 - Math.floor(daysLeft / 14))) : 0

  const handleGetStarted = () => {
    navigate(isLoggedIn ? '/dashboard' : '/signup')
  }

  const handleViewMockTests = () => {
    navigate(isLoggedIn ? '/practice/mock-tests' : '/login')
  }

  useEffect(() => {
    const current = WORDS[wordIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Keep appending one character until the whole word is typed.
        setDisplayText(current.slice(0, displayText.length + 1))
        if (displayText.length + 1 === current.length) {
          // Word fully typed — wait a bit, then start deleting.
          setTimeout(() => setIsDeleting(true), PAUSE_MS)
        }
      } else {
        // Remove one character at a time until the string is empty.
        setDisplayText(current.slice(0, displayText.length - 1))
        if (displayText.length - 1 === 0) {
          // Done deleting — advance to the next word (wraps around).
          setIsDeleting(false)
          setWordIndex((i) => (i + 1) % WORDS.length)
        }
      }
    }, isDeleting ? DELETE_SPEED : TYPE_SPEED)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, wordIndex])

  return (
    <section className="bg-blue-50 dark:bg-slate-950 pt-16 pb-20 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl md:text-5xl leading-tight mb-4">
              <span className="font-bold text-gray-900 dark:text-white">Master the interview</span>
              <br />
              <span className="font-bold text-gray-900 dark:text-white">Land the{' '}</span>
              <span className="text-indigo-500 dark:text-indigo-400 italic">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed pb-6 max-w-md">
              PrepEdge is your intelligent interview companion. Practice with FAANG-grade
              questions, take timed mock tests, and track your readiness with real analytics.
            </p>

            <div className="flex flex-wrap items-center gap-3 pb-7">
              <button
                onClick={handleGetStarted}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
              </button>
              <button
                onClick={handleViewMockTests}
                className="inline-flex items-center gap-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                <BarChart2 className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                View Mock Tests
              </button>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatStat(stats.totalUsers)}</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-slate-500 uppercase">Active Users</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatStat(stats.totalQuestions)}</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-slate-500 uppercase">Questions</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
              <div>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">1,200+</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 dark:text-slate-500 uppercase">Offers Landed</p>
              </div>
            </div>
          </div>

          {/* Right — code card */}
          <div className="flex-1 max-w-lg relative">
            {/* Goal floating card — top right. Shows the signed-in user's real
                target + countdown once loaded; falls back to a "set a goal"
                prompt for guests or users who haven't set one yet. */}
            <div className="absolute -top-4 -right-4 z-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 px-4 py-3 flex items-center gap-3 min-w-45 transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                {hasGoal ? (
                  <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    {(username || 'U').charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <div>
                <p className="text-gray-900 dark:text-slate-100 text-xs font-semibold">
                  {hasGoal ? `${targetLabel ?? 'Your'} Goal` : 'Set Your Goal'}
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-[10px]">
                  {hasGoal
                    ? daysLeft === 0
                      ? 'Interview day!'
                      : `${daysLeft} days · On track`
                    : 'Pick an interview date'}
                </p>
              </div>
              <div className="flex gap-0.5 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < urgencyDots ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-slate-600'}`}
                  />
                ))}
              </div>
            </div>

            {/* Code editor card */}
            <div className="bg-[#1e1e2e] rounded-2xl shadow-2xl overflow-hidden float">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-gray-500 text-xs">solution.js</span>
              </div>
              {/* Code content */}
              <div className="p-5 font-mono text-xs leading-6">
                <pre className="text-gray-300 whitespace-pre-wrap">
                  <span className="text-purple-400">function </span>
                  <span className="text-yellow-300">twoSum</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-orange-300">nums</span>
                  <span className="text-gray-300">, </span>
                  <span className="text-orange-300">target</span>
                  <span className="text-gray-300">) {'{'}</span>
                  {'\n'}
                  <span className="text-gray-300">  </span>
                  <span className="text-purple-400">const </span>
                  <span className="text-blue-300">map </span>
                  <span className="text-gray-300">= </span>
                  <span className="text-purple-400">new </span>
                  <span className="text-yellow-300">Map</span>
                  <span className="text-gray-300">();</span>
                  {'\n'}
                  <span className="text-purple-400">  for </span>
                  <span className="text-gray-300">(</span>
                  <span className="text-purple-400">let </span>
                  <span className="text-blue-300">i </span>
                  <span className="text-gray-300">= 0; </span>
                  <span className="text-blue-300">i </span>
                  <span className="text-gray-300">{'<'} </span>
                  <span className="text-orange-300">nums</span>
                  <span className="text-gray-300">.length; </span>
                  <span className="text-blue-300">i</span>
                  <span className="text-gray-300">++) {'{'}</span>
                  {'\n'}
                  <span className="text-purple-400">    const </span>
                  <span className="text-blue-300">complement </span>
                  <span className="text-gray-300">= </span>
                  <span className="text-orange-300">target </span>
                  <span className="text-gray-300">- </span>
                  <span className="text-orange-300">nums</span>
                  <span className="text-gray-300">[</span>
                  <span className="text-blue-300">i</span>
                  <span className="text-gray-300">];</span>
                  {'\n'}
                  <span className="text-purple-400">    if </span>
                  <span className="text-gray-300">(</span>
                  <span className="text-blue-300">map</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">has</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-blue-300">complement</span>
                  <span className="text-gray-300">)) {'{'}</span>
                  {'\n'}
                  <span className="text-purple-400">      return </span>
                  <span className="text-gray-300">[</span>
                  <span className="text-blue-300">map</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">get</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-blue-300">complement</span>
                  <span className="text-gray-300">), </span>
                  <span className="text-blue-300">i</span>
                  <span className="text-gray-300">];</span>
                  {'\n'}
                  <span className="text-gray-300">    {'}'}</span>
                  {'\n'}
                  <span className="text-blue-300">    map</span>
                  <span className="text-gray-300">.</span>
                  <span className="text-yellow-300">set</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-orange-300">nums</span>
                  <span className="text-gray-300">[</span>
                  <span className="text-blue-300">i</span>
                  <span className="text-gray-300">], </span>
                  <span className="text-blue-300">i</span>
                  <span className="text-gray-300">);</span>
                  {'\n'}
                  <span className="text-gray-300">  {'}'}</span>
                  {'\n'}
                  <span className="text-gray-300">{'}'}</span>
                </pre>
              </div>
            </div>

            {/* Latest result floating card — bottom left. Shows the signed-in
                user's real last test score once loaded; falls back to a
                "take a test" prompt for guests or users with no attempts yet. */}
            <div className="absolute -bottom-4 -left-4 z-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 px-4 py-3 flex items-center gap-3 transition-colors duration-200">
              {latestTest ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <FileText className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
              )}
              <div>
                <p className="text-gray-900 dark:text-slate-100 text-xs font-semibold">
                  {latestTest ? 'Test Passed' : 'No Tests Yet'}
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-[10px]">
                  {latestTest
                    ? `${Math.round(latestTest.accuracy)}% Accuracy · ${latestTest.category ?? `${latestTest.score}/${latestTest.total}`}`
                    : 'Take your first mock test'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
