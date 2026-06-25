import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      {
        text: "By accessing or using PrepEdge (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, please do not use the Service. These Terms apply to all visitors, registered users, and anyone else who accesses PrepEdge.",
      },
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      {
        text: "You must be at least 13 years old to use PrepEdge. By creating an account, you represent and warrant that you meet this age requirement and that all registration information you provide is accurate and complete.",
      },
    ],
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: [
      {
        subtitle: "Account Creation",
        text: "You may register using an email address and password or through a supported third-party provider (currently Google). You are responsible for maintaining the confidentiality of your credentials.",
      },
      {
        subtitle: "Account Security",
        text: "You are responsible for all activity that occurs under your account. Notify us immediately at support@prepedge.com if you suspect unauthorized access. We are not liable for any loss arising from your failure to keep credentials secure.",
      },
      {
        subtitle: "One Account Per Person",
        text: "Each person may hold only one active account. Creating multiple accounts to circumvent restrictions or abuse platform features is prohibited.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    content: [
      {
        text: "You agree not to:",
      },
      {
        list: [
          "Copy, distribute, or sell any questions, test content, or other proprietary material from PrepEdge",
          "Use automated bots, scrapers, or scripts to access or collect data from the platform",
          "Attempt to reverse-engineer, decompile, or tamper with the platform",
          "Impersonate another user, employee, or any other person",
          "Submit false, misleading, or harmful content",
          "Circumvent any security measures, rate limits, or access controls",
          "Use the Service for any unlawful purpose or in violation of any applicable law",
        ],
      },
      {
        text: "Violation of these rules may result in immediate suspension or permanent termination of your account.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "5. Intellectual Property",
    content: [
      {
        subtitle: "Our Content",
        text: "All content on PrepEdge — including questions, test sets, explanations, graphics, and software — is owned by PrepEdge or its licensors and is protected by copyright, trademark, and other intellectual property laws.",
      },
      {
        subtitle: "Your Content",
        text: "If you submit content (e.g. forum posts, code submissions, or feedback), you grant PrepEdge a non-exclusive, worldwide, royalty-free licence to use, display, and improve the Service using that content. You retain ownership of anything you submit.",
      },
      {
        subtitle: "Feedback",
        text: "Any feedback or suggestions you provide may be used by PrepEdge without obligation to you.",
      },
    ],
  },
  {
    id: "subscriptions",
    title: "6. Free & Premium Plans",
    content: [
      {
        text: "PrepEdge currently offers a free tier. If premium plans are introduced in the future, specific pricing, billing cycles, refund policies, and feature entitlements will be disclosed clearly at the time of purchase. Any paid subscriptions will be governed by supplemental terms presented at checkout.",
      },
    ],
  },
  {
    id: "disclaimers",
    title: "7. Disclaimers",
    content: [
      {
        text: "The Service is provided \"as is\" and \"as available\" without warranties of any kind, express or implied. PrepEdge does not warrant that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not guarantee that using PrepEdge will result in job placement, interview success, or any specific outcome.",
      },
    ],
  },
  {
    id: "liability",
    title: "8. Limitation of Liability",
    content: [
      {
        text: "To the maximum extent permitted by applicable law, PrepEdge and its team shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of data, revenue, or goodwill — arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.",
      },
    ],
  },
  {
    id: "termination",
    title: "9. Termination",
    content: [
      {
        text: "We reserve the right to suspend or terminate your account at any time, with or without notice, if we determine (in our sole discretion) that you have violated these Terms or that your use poses a risk to the platform or other users.",
      },
      {
        text: "You may delete your account at any time from your account settings. Upon deletion, your data will be removed in accordance with our Privacy Policy.",
      },
    ],
  },
  {
    id: "governing-law",
    title: "10. Governing Law",
    content: [
      {
        text: "These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in India.",
      },
    ],
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    content: [
      {
        text: "We may revise these Terms at any time. When we make material changes, we will update the 'Last Updated' date and notify you via email or an in-app notice. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms.",
      },
    ],
  },
  {
    id: "contact",
    title: "12. Contact Us",
    content: [
      {
        text: "If you have questions about these Terms, please contact us:",
      },
      {
        contact: {
          email: "legal@prepedge.com",
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

export default function TermsOfServicePage() {
  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Hero */}
      <section className="bg-blue-50 dark:bg-slate-800/60 pt-16 pb-20 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Legal
        </span>
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10">
            <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Terms of <span className="text-indigo-500 italic">Service</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Please read these terms carefully before using PrepEdge. By using our platform you agree to be bound by them.
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
          Questions about our terms?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto text-sm">
          We're happy to clarify anything. Reach out and we'll get back to you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/help/support"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-sm"
          >
            Contact Support
          </Link>
          <Link
            to="/privacy"
            className="inline-block border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold px-6 py-3 rounded-full hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm"
          >
            Privacy Policy
          </Link>
        </div>
      </section>
    </div>
  );
}
