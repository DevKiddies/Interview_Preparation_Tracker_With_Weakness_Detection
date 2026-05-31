import { CirclePlay, CheckCircle2, X } from 'lucide-react'

const codeSnippet = `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`

export default function HeroSection() {
  return (
    <section className="bg-blue-50 pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left */}
          <div className="flex-1 max-w-xl">
            <div className="inline-flex items-center gap-2 border border-indigo-200 bg-white text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                NEW
              </span>
              System Design Masterclass is Live!
              <X className="w-3 h-3 text-gray-400 cursor-pointer" />
            </div>

            <h1 className="text-4xl md:text-5xl  leading-tight mb-4">
              <span className='font-bold text-gray-900'>Master the interview</span>
              <br />
              <span className='font-bold text-gray-900'>Land the{' '}</span>
              
              
              <span className="text-indigo-500 italic">dream job.</span>
            </h1>

            <p className="text-gray-500 text-sm leading-relaxed pb-6 max-w-md">
              PrepEdge is your intelligent interview companion. Practice with FAANG-grade
              questions, take timed mock tests, and track your readiness with real analytics.
            </p>

            <div className="flex flex-wrap items-center gap-3 pb-7">
              <a
                href="#"
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Start for Free
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              >
                <CirclePlay className="w-4 h-4 text-gray-500" />
                View Courses
              </a>
            </div>

            <div className="flex items-center gap-8">
              <div>
                <p className="text-2xl font-bold text-gray-900">15,000+</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Active Users</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-gray-900">5,000+</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Questions</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">1,200+</p>
                <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">Offers Landed</p>
              </div>
            </div>
          </div>

          {/* Right — code card */}
          <div className="flex-1 max-w-lg relative">
            {/* SDE-2 Goal floating card — top right */}
            <div className="absolute -top-4 -right-4 z-10 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[180px]">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-bold">S</span>
              </div>
              <div>
                <p className="text-gray-900 text-xs font-semibold">SDE-2 Goal</p>
                <p className="text-gray-400 text-[10px]">84 days · On track</p>
              </div>
              <div className="flex gap-0.5 ml-auto">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-indigo-500' : 'bg-gray-200'}`}
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
                <span className="ml-3 text-gray-500 text-xs ">solution.js</span>
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

            {/* Test Passed floating card — bottom left */}
            <div className="absolute -bottom-4 -left-4 z-10 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="text-gray-900 text-xs font-semibold">Test Passed</p>
                <p className="text-gray-400 text-[10px]">98% Accuracy · One solution</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
