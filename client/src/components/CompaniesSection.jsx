// CompaniesSection.jsx — social proof strip on the landing page listing companies
// that PrepEdge users have been placed at. Update this list as the team adds partners.

const companies = ['Google', 'Meta', 'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'Zepto']

export default function CompaniesSection() {
  return (
    <section className="relative bg-white dark:bg-slate-950 py-10 transition-colors duration-200">
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-widest text-gray-400 dark:text-slate-500 uppercase pb-6">
          PrepEdge Users Work At
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((company) => (
            <span
              key={company}
              className="text-gray-400 dark:text-slate-500 font-medium text-sm hover:text-gray-600 dark:hover:text-slate-300 transition-colors cursor-default"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
