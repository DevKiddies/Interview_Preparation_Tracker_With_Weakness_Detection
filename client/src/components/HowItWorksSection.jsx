const steps = [
  {
    number: '01',
    title: 'Create your profile',
    description:
      'Tell us your target company, experience level, and interview date. Takes 2 minutes.',
  },
  {
    number: '02',
    title: 'Take mock tests',
    description:
      'Attempt curated tests tailored to your goal. Get instant, detailed feedback.',
  },
  {
    number: '03',
    title: 'Track & improve',
    description:
      "Study your radar chart. Fix weak spots. Repeat until you're ready to fly.",
  },
]

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-blue-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Start cracking interviews in 3 steps
          </h2>
          <p className="text-gray-500 text-sm">
            No complexity. Just structure, practice, and progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center hover:translate-y-2 hover:shadow-xl transition-transform duration-300 ease-in-out"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto mb-5">
                <span className="text-white text-sm font-bold">{step.number}</span>
              </div>
              <h3 className="text-gray-900 font-semibold text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
