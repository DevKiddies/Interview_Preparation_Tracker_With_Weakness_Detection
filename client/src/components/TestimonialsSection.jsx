// TestimonialsSection.jsx — social proof section on the landing page showing
// student success stories. Testimonials are static data — update them here
// as real user reviews come in.

import { Shield, RefreshCw, BadgeCheck, Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'AS',
    color: 'bg-amber-500',
    name: 'Anjali Sharma',
    role: 'SDE-2 @ Google',
    quote:
      '"PrepEdge\'s weakness radar helped me identify database as my Achilles heel. 3 weeks later I cracked the Google L4 interview. The mock tests are eerily close to the real thing."',
  },
  {
    initials: 'RV',
    color: 'bg-blue-500',
    name: 'Rahul Verma',
    role: 'Software Engineer @ Meta',
    quote:
      '"I tried 4 other platforms. Nothing came close to PrepEdge\'s analytics. The confidence vs accuracy chart alone saved me from overconfident mistakes in my Meta loop."',
  },
  {
    initials: 'PK',
    color: 'bg-purple-500',
    name: 'Priya Kapoor',
    role: 'Product Engineer @ Flipkart',
    quote:
      '"The chatroom mentors are insanely helpful. I got my system design questions answered by an ex-Uber staff engineer at 11 PM. That\'s not available anywhere else."',
  },
]

const trustStats = [
  { icon: Shield, label: 'Trusted by 15,000+ developers' },
  { icon: RefreshCw, label: 'Fresh questions updated weekly' },
  { icon: BadgeCheck, label: '1,200+ verified offers' },
  { icon: Star, label: '4.9/5 average user rating' },
]

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 bg-white dark:bg-slate-950 transition-colors duration-200">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800 px-3 py-1 rounded-full mb-4">
            Success Stories
          </span>
          <p className="text-3xl font-bold text-neutral-950 dark:text-white pb-3">What our users say</p>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            Real stories from developers who landed their dream roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 flex flex-col hover:translate-y-2 hover:shadow-xl dark:hover:shadow-slate-900/70 transition-all duration-300 ease-in-out"
            >
              <StarRating />
              <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed flex-1 mb-5">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="text-gray-900 dark:text-slate-100 text-sm font-semibold">{t.name}</p>
                  <p className="text-gray-400 dark:text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-2 justify-center">
                <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="text-gray-600 dark:text-slate-400 text-xs font-medium">{stat.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
