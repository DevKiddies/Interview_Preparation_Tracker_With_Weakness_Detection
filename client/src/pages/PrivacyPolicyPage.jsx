import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a PrepEdge account, we collect your name, email address, and password (stored as a secure hash). If you sign up via Google OAuth, we receive your name, email, and profile picture from Google.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect information about how you interact with the platform — including pages visited, problems attempted, test scores, time spent per question, and feature usage. This data drives our weakness detection engine.",
      },
      {
        subtitle: "Device & Log Data",
        text: "We collect standard server logs including your IP address, browser type, operating system, and referring URLs. This information is used for security, debugging, and analytics.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        text: "We use the information we collect to:",
      },
      {
        list: [
          "Provide, operate, and improve the PrepEdge platform",
          "Personalise your learning experience and surface relevant practice content",
          "Detect patterns in your performance and generate weakness reports",
          "Send transactional emails such as email verification and password resets",
          "Send optional product updates and newsletters (you can unsubscribe at any time)",
          "Detect and prevent fraud, abuse, and security incidents",
          "Comply with legal obligations",
        ],
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Disclosure",
    content: [
      {
        text: "We do not sell your personal data. We may share information only in the following circumstances:",
      },
      {
        subtitle: "Service Providers",
        text: "We engage trusted third-party vendors (e.g. cloud hosting, email delivery, analytics) who process data solely on our behalf and are bound by confidentiality agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose information if required by law, court order, or governmental authority, or if we believe disclosure is necessary to protect the safety of any person or to prevent illegal activity.",
      },
      {
        subtitle: "Business Transfers",
        text: "If PrepEdge is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before your data is subject to a different privacy policy.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      {
        text: "We retain your account information and usage data for as long as your account is active or as needed to provide you with our services. If you delete your account, we will permanently remove your personal data within 7 days, except where retention is required by law.",
      },
    ],
  },
  {
    id: "cookies",
    title: "5. Cookies & Tracking",
    content: [
      {
        text: "PrepEdge uses cookies and similar technologies to keep you signed in, remember your preferences, and analyse usage patterns. You can control cookie behaviour through your browser settings. Disabling cookies may affect some platform features.",
      },
    ],
  },
  {
    id: "security",
    title: "6. Security",
    content: [
      {
        text: "We implement industry-standard security measures including JWT-based authentication, HTTPS encryption in transit, and hashed password storage. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password and to report any suspected security issues to us immediately.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    content: [
      {
        text: "Depending on your location, you may have the right to:",
      },
      {
        list: [
          "Access the personal data we hold about you",
          "Correct inaccurate or incomplete data",
          "Request deletion of your personal data",
          "Object to or restrict certain processing activities",
          "Export your data in a portable format",
        ],
      },
      {
        text: "To exercise any of these rights, contact us at privacy@prepedge.com. We will respond within 30 days.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    title: "8. Children's Privacy",
    content: [
      {
        text: "PrepEdge is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their data, please contact us and we will promptly delete it.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        text: "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last Updated' date at the top of this page and, where the changes are significant, notify you via email or an in-app banner. Your continued use of PrepEdge after any changes constitutes your acceptance of the new policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: [
      {
        text: "If you have any questions or concerns about this Privacy Policy or your personal data, please reach out:",
      },
      {
        contact: {
          email: "privacy@prepedge.com",
          address: "PrepEdge, India",
        },
      },
    ],
  },
];

function SectionBlock({ section }) {
  return (
    <div id={section.id} className="flex flex-col gap-4 scroll-mt-24">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.title}</h2>
      {section.content.map((block, i) => {
        if (block.list) {
          return (
            <ul key={i} className="list-disc list-inside flex flex-col gap-1.5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed pl-1">
              {block.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.contact) {
          return (
            <div key={i} className="flex flex-col gap-1 text-sm text-slate-500 dark:text-slate-400">
              <p>Email: <a href={`mailto:${block.contact.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">{block.contact.email}</a></p>
              <p>Address: {block.contact.address}</p>
            </div>
          );
        }
        return (
          <div key={i}>
            {block.subtitle && (
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-1">{block.subtitle}</p>
            )}
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{block.text}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-blue-50 dark:bg-slate-800/60 pt-16 pb-20 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Legal
        </span>
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10">
            <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Privacy <span className="text-indigo-500 italic">Policy</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          We value your privacy. This policy explains what data we collect, how we use it, and the choices you have.
        </p>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">Last updated: June 2026</p>
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* ToC */}
          <div className="mb-12 p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">Contents</p>
            <ol className="flex flex-col gap-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-10 divide-y divide-slate-100 dark:divide-slate-800">
            {sections.map((s) => (
              <div key={s.id} className="pt-10 first:pt-0">
                <SectionBlock section={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-14 px-6 bg-slate-50/60 dark:bg-slate-900/60 text-center">
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-500/40 to-transparent" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
          Questions about your privacy?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
          We're happy to explain how we handle your data. Reach out anytime.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/help/support"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
          >
            Contact Support
          </Link>
          <Link
            to="/terms"
            className="inline-block border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold px-6 py-3 rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm"
          >
            Terms of Service
          </Link>
        </div>
      </section>
    </div>
  );
}
