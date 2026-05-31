export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <span className="text-neutral-950 font-semibold text-md">
              Prep<span className="text-[var(--primary)] font-bold">Edge</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {['Courses', 'Mock Tests', 'About', 'Help'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-800 p-2 hover:bg-neutral-100 hover:text-[var(--primary)] rounded-2xl transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* <a href="#" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"> */}
          <a href='#' className="bg-gray-200 text-gray-800 mx-2 border-gray-300 rounded-4xl py-1 px-4 hover:bg-gray-300 [box-shadow:0_2px_6px_rgba(0,0,255,0.2)] text-center transition-all duration-200">
            Login
          </a>
          <a
            href="#"
            // className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-full transition-colors"
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white mx-2 border-blue-500 rounded-4xl py-1 px-4 hover:from-blue-700 hover:to-blue-600 [box-shadow:0_2px_6px_rgba(0,0,255,0.35)] text-center transition-all duration-200"
          >
            Sign Up Free
          </a>
        </div>
      </div>
    </nav>
  )
}
