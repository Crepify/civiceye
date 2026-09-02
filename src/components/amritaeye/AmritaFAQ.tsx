import { useState } from 'react';

const faqs = [
  {
    question: "Do I need an account to report an issue?",
    answer: "Yes, you need to sign in with your campus credentials. This helps us prevent spam and allows us to update you on the status of your report."
  },
  {
    question: "What kinds of issues can I report?",
    answer: "You can report anything from broken lights, plumbing leaks, and Wi-Fi dead zones, to structural damage and safety hazards on campus."
  },
  {
    question: "How long does it take for an issue to get fixed?",
    answer: "Response times vary by department and severity. Critical safety hazards are prioritized immediately, while routine maintenance usually takes 2-3 business days."
  },
  {
    question: "Will I be notified when my report is resolved?",
    answer: "Yes. You will receive an automated notification as soon as the maintenance team marks your reported issue as resolved."
  },
  {
    question: "Can I see what others have reported?",
    answer: "Yes, the campus map and feed show all public reports. This prevents duplicate submissions and keeps the community informed."
  },
  {
    question: "What if an issue is an emergency?",
    answer: "For immediate emergencies (e.g., major flooding, fire, severe security threats), please call campus security directly instead of using the app."
  }
];

export function AmritaFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#FFF5F7] dark:bg-[#1A030A] border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
      <div className="mx-auto max-w-[800px] px-6 py-28 sm:py-36">
        <h2 className="mb-16 text-3xl sm:text-4xl font-bold leading-[1.2] tracking-tight text-neutral-900 dark:text-white">
          Frequently asked questions
        </h2>

        <div className="flex flex-col border-t border-neutral-200 dark:border-neutral-800">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between py-8 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-[#111113] focus-visible:outline-none"
                >
                  <span className={`text-xl font-semibold leading-[1.3] transition-colors ${isOpen ? 'text-[#A51636] dark:text-[#E52B50]' : 'text-neutral-900 dark:text-white'}`}>
                    {faq.question}
                  </span>
                  <svg
                    className={`ml-6 h-6 w-6 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#A51636] dark:text-[#E52B50]' : 'text-neutral-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-8 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-base leading-[1.5] text-neutral-600 dark:text-neutral-400 px-4 border-l-2 border-[#A51636] dark:border-[#E52B50]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
