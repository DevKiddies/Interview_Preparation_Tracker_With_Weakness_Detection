// FeaturesSection.jsx — landing page section highlighting the platform's key features.
// Each feature card is driven by the features array so adding a new capability only
// requires adding an entry there — no JSX changes needed.

import { Code2, Clock, BarChart3, Users, Sparkles, Flame, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Curated Question Bank',
    description: 'Top 500+ questions asked by FAANG companies, categorized by pattern and difficulty.',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Clock,
    title: 'Timed Mock Assessments',
    description: 'Full-length tests that simulate real interviews with proctored timer and instant results.',
    gradient: 'from-teal-400 to-green-500',
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    description: 'Radar charts, confidence vs accuracy trends, and topic-wise breakdown to spot weaknesses.',
    gradient: 'from-orange-400 to-red-500',
  },
  {
    icon: Users,
    title: 'Peer Community',
    description: 'Live chatrooms with mentors from Google, Meta, Amazon. Get unstuck in real time.',
    gradient: 'from-pink-500 to-purple-600',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'AI-powered suggestions on what to study next, tuned to your interview date.',
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    icon: Flame,
    title: 'Streak & Progress',
    description: 'Visual roadmaps, daily streaks, and milestones to keep you consistent every day.',
    gradient: 'from-violet-500 to-purple-700',
  },
]

export default function FeaturesSection() {
  return (
    <section className="relative py-20 bg-blue-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full mb-4">
            Why PrepEdge
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Comprehensive tools designed specifically for tech interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 hover:translate-y-2 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 ease-in-out"
              >
                <div className={`bg-linear-to-r ${feature.gradient} h-24 flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div className="p-5">
                  <h3 className="text-gray-900 dark:text-slate-100 font-semibold text-sm mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed mb-4">{feature.description}</p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:gap-2 transition-all"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
