const companies = ['Google', 'Meta', 'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'Zepto']

export default function CompaniesSection() {
  return (
    <section className="bg-white py-10 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase pb-6">
          PrepEdge Users Work At
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((company) => (
            <span
              key={company}
              className="text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors cursor-default"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
