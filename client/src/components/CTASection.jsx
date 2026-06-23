import { Rocket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CTASection() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    const token = localStorage.getItem('token')
    navigate(token ? '/dashboard' : '/signup')
  }

  return (
    <section className="relative bg-[#1a2545] dark:bg-slate-900 py-24 transition-colors duration-200">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-900/60 border border-indigo-700 dark:border-indigo-800 px-3 py-1 rounded-full mb-6">
          <Rocket className="w-3 h-3" />
          Get Started Today
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white pb-4">
          Ready to ace your next interview?
        </h2>
        <p className="text-indigo-200/80 dark:text-slate-400 text-sm pb-6 leading-relaxed">
          Join thousands of developers landing jobs at top tech companies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto bg-white dark:bg-indigo-600 text-[#1a2545] dark:text-white font-semibold text-sm px-7 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </button>
          <a
            href="/help/faqs"
            className="w-full sm:w-auto border border-white/30 dark:border-slate-600 text-white font-semibold text-sm px-7 py-3 rounded-full hover:bg-white/10 dark:hover:bg-slate-800 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}
