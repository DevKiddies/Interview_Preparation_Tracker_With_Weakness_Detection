// OurTeamPage.jsx — team introduction page listing the people who built PrepEdge.
// Update the 'team' array below when new members join or roles change.

import { ExternalLink, Globe, Mail } from "lucide-react";
import suhaniPhoto from "../assets/team/Suhani.PNG";
import utkarshPhoto from "../assets/team/utkarsh.jpg";
import varadPhoto from "../assets/team/varad.jpeg";
import tanishqPhoto from "../assets/team/tanishq.jpeg";
import saurabhPhoto from "../assets/team/saurabh.jpeg";

const team = [
  {
    name: "Suhani Mahendra Tatiya",
    role: "Full Stack Developer",
    bio: "Drives end-to-end feature delivery with a sharp eye for UI polish and data flow. Suhani bridges React frontends with robust Spring Boot services, making complex features feel effortless to users.",
    avatar: "ST",
    photo: suhaniPhoto,
    color: "bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Utkarsh Kumar",
    role: "Full Stack Developer",
    bio: "Architects the core backend infrastructure and authentication systems. Utkarsh specialises in JWT-secured APIs, database design, and keeping the platform fast, safe, and scalable under pressure.",
    avatar: "UK",
    photo: utkarshPhoto,
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Varad Ijantkar",
    role: "Full Stack Developer",
    bio: "Owns the intelligence layer — from weakness detection algorithms to AI interview simulations. Varad turns raw performance data into actionable insights that help users improve where it counts most.",
    avatar: "VI",
    photo: varadPhoto,
    color: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Tanishq Bodh",
    role: "Full Stack Developer",
    bio: "Leads the practice and assessment engine — curating question banks, building timed mock tests, and wiring up the scoring pipeline. Tanishq ensures every test mirrors the pressure of a real interview.",
    avatar: "TB",
    photo: tanishqPhoto,
    color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    github: "#",
    linkedin: "#",
    email: "#",
  },
  {
    name: "Saurabh Yadav",
    role: "Full Stack Developer",
    bio: "Handles deployment pipelines, cloud infrastructure, and system reliability. Saurabh ensures PrepEdge stays live, responsive, and secure — so the rest of the team can ship confidently.",
    avatar: "SY",
    photo: saurabhPhoto,
    color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    github: "#",
    linkedin: "#",
    email: "#",
  },
];

function TeamCard({ name, role, bio, avatar, photo, color, github, linkedin, email }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col items-center text-center">
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-16 h-16 rounded-2xl object-cover object-top mb-4"
        />
      ) : (
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-extrabold mb-4 ${color}`}
        >
          {avatar}
        </div>
      )}
      <p className="font-bold text-slate-900 dark:text-white text-base">{name}</p>
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5 mb-3">
        {role}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-5">{bio}</p>

      <div className="flex items-center gap-3 mt-auto">
        <a
          href={github}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-slate-600 hover:text-white transition-colors duration-200"
          aria-label="GitHub"
        >
          <ExternalLink size={14} />
        </a>
        <a
          href={linkedin}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-colors duration-200"
          aria-label="LinkedIn"
        >
          <Globe size={14} />
        </a>
        <a
          href={email}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white transition-colors duration-200"
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
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-blue-50 dark:bg-slate-800/60 pt-16 pb-20 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          The People
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Meet the team behind{" "}
          <span className="text-indigo-500 italic">PrepEdge</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
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
      <section className="relative py-14 px-6 bg-slate-50/60 dark:bg-slate-900/60">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Want to contribute?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-7 leading-relaxed">
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
