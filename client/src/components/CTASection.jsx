import { Rocket } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="bg-[#1a2545] py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 bg-indigo-900/60 border border-indigo-700 px-3 py-1 rounded-full mb-6">
          <Rocket className="w-3 h-3" />
          Get Started Today
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white pb-4">
          Ready to ace your next interview?
        </h2>
        <p className="text-indigo-200/80 text-sm pb-6 leading-relaxed">
          Join thousands of developers landing jobs at top tech companies.{' '}
          Free to start, no credit card needed.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            className="w-full sm:w-auto bg-white text-[#1a2545] font-semibold text-sm px-7 py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            Start for Free
          </a>
          <a
            href="#"
            className="w-full sm:w-auto border border-white/30 text-white font-semibold text-sm px-7 py-3 rounded-full hover:bg-white/10 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  )
}
