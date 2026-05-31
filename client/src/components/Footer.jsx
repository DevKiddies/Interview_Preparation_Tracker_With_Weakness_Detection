import { Globe, GitBranch, BarChart2, Send } from 'lucide-react'
import { useState } from 'react'

const platformLinks = ['Courses', 'Mock Tests', 'Dashboard', 'Community', 'Results']
const companyLinks = ['About Us', 'Help Center', 'Admin', 'Blog', 'Careers']
const legalLinks = ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Security']

export default function Footer() {
  const [email, setEmail] = useState('')

  return (
    <footer className="bg-[#eef0f8] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-gray-900 font-semibold text-sm">
                Prep<span className="font-bold">Edge</span>
              </span>
            </a>
            <p className="text-gray-500 text-xs leading-relaxed mb-5 max-w-xs">
              The intelligent interview preparation platform for ambitious developers. Master DSA,
              system design, and land your dream role.
            </p>
            <div className="flex items-center gap-3">
              {[Globe, GitBranch, BarChart2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-7 bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-gray-900 text-xs font-semibold pb-3">Stay updated</p>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 transition-colors"
                />
                <button className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center transition-colors">
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <p className="text-gray-900 text-xs font-semibold mb-4">Platform</p>
            <ul className="space-y-2.5">
              {platformLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 text-xs hover:text-gray-800 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-gray-900 text-xs font-semibold mb-4">Company</p>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 text-xs hover:text-gray-800 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-gray-900 text-xs font-semibold mb-4">Legal</p>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-500 text-xs hover:text-gray-800 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-gray-400 text-xs">
            © 2026 PrepEdge. All rights reserved. Built with{' '}
            <span className="text-red-500">♥</span> for developers.
          </p>
        </div>
      </div>
    </footer>
  )
}
