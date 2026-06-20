import { ExternalLink, Globe, Mail } from "lucide-react";

const team = [
  {
    name: "Utkarsh Yadav",
    role: "Full Stack Developer",
    bio: "Handles backend architecture, auth systems, and Spring Boot APIs.",
    avatar: "UY",
    color: "bg-blue-100 text-blue-600",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Team Member 2",
    role: "Frontend Developer",
    bio: "Crafts the UI/UX experience with React and Tailwind.",
    avatar: "TM",
    color: "bg-indigo-100 text-indigo-600",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Team Member 3",
    role: "AI / ML Engineer",
    bio: "Builds the weakness detection engine and AI interview features.",
    avatar: "TM",
    color: "bg-purple-100 text-purple-600",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Team Member 4",
    role: "Backend Developer",
    bio: "Manages database design, Redis caching, and service integrations.",
    avatar: "TM",
    color: "bg-emerald-100 text-emerald-600",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Team Member 5",
    role: "DevOps / QA",
    bio: "Ensures smooth deployments, testing pipelines, and system reliability.",
    avatar: "TM",
    color: "bg-rose-100 text-rose-600",
    github: "#",
    linkedin: "#",
    email: "#",
  },
];

function TeamCard({ name, role, bio, avatar, color, github, linkedin, email }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col items-center text-center">
      {/* Avatar */}
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold mb-4 ${color}`}
      >
        {avatar}
      </div>
      <p className="font-bold text-slate-900 text-base">{name}</p>
      <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-0.5 mb-3">
        {role}
      </p>
      <p className="text-slate-500 text-sm leading-relaxed mb-5">{bio}</p>

      {/* Social links */}
      <div className="flex items-center gap-3 mt-auto">
        <a
          href={github}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white transition-colors duration-200"
          aria-label="GitHub"
        >
          <ExternalLink size={14} />
        </a>
        <a
          href={linkedin}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-colors duration-200"
          aria-label="LinkedIn"
        >
          <Globe size={14} />
        </a>
        <a
          href={email}
          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-indigo-500 hover:text-white transition-colors duration-200"
          aria-label="Email"
        >
          <Mail size={14} />
        </a>
      </div>
    </div>
  );
}

export default function OurTeamPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-blue-50 pt-16 pb-20 px-6 text-center">
        <span className="inline-block bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          The People
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 leading-tight">
          Meet the team behind{" "}
          <span className="text-indigo-500 italic">PrepEdge</span>
        </h1>
        <p className="text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          We're a group of engineering students from CDAC who turned a shared frustration
          into a product. Small team, big ambition.
        </p>
      </section>

      {/* Team Grid */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-14 px-6 bg-slate-50/60 border-t border-slate-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Want to contribute?
          </h2>
          <p className="text-slate-500 mb-7 leading-relaxed">
            PrepEdge is open to collaborators. If you're passionate about developer education
            and want to build something meaningful, we'd love to hear from you.
          </p>
          <a
            href="/about/contact"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
