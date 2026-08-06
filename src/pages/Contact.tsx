import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/useToast';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name.'),
  email: z.string().email('Please enter a valid email address.'),
  subject: z.string().min(4, 'Please add a short subject.'),
  message: z.string().min(10, 'Your message should be at least 10 characters.'),
  ward: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

const INFO = [
  { icon: Mail, label: 'Email', value: 'hello@civiceye.app' },
  { icon: Phone, label: 'Phone', value: '+91 80 1234 5678' },
  { icon: MapPin, label: 'Office', value: 'Indiranagar, Bengaluru 560038' },
  { icon: Clock, label: 'Response time', value: 'Within 1–2 working days' },
];

/** Contact page with a validated form (prototype — no real submission). */
export function Contact() {
  const toast = useToast();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactForm) => {
    // Prototype: simulate a network request.
    await new Promise((r) => setTimeout(r, 1200));
    console.info('[CivicEye] contact form (prototype)', data);
    setSent(true);
    toast.success('Message sent!', 'We\u2019ll get back to you within 1–2 working days.');
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact us"
        title="Talk to the team"
        description="Questions, partnerships, or a ward office that wants in? We\u2019d love to hear from you."
      />

      <section className="section-pad py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Info panel */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 lg:col-span-2"
          >
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Reach us directly
              </h2>
              <ul className="mt-5 space-y-4">
                {INFO.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.value}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card relative overflow-hidden bg-gradient-to-br from-primary-600 to-emerald-600 p-6 text-white">
              <h3 className="text-base font-bold">For authorities</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                Ward officers and agencies: request a demo dashboard for your jurisdiction.
              </p>
              <p className="mt-4 text-sm font-semibold">gov@civiceye.app</p>
            </div>
          </motion.aside>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="card p-6 sm:p-8">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12 text-center"
                >
                  <CheckCircle2 className="mb-4 h-14 w-14 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Message sent! 🎉
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    Thanks for reaching out. This is a prototype, so nothing was actually emailed —
                    but in a real deployment this would land straight in our inbox.
                  </p>
                  <button onClick={() => setSent(false)} className="btn-secondary mt-6">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="label-base">
                        Full name
                      </label>
                      <input
                        id="name"
                        {...register('name')}
                        className="input-base"
                        placeholder="e.g. Ananya Rao"
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name ? (
                        <p className="mt-1.5 text-xs font-medium text-rose-600">
                          {errors.name.message}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="email" className="label-base">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="input-base"
                        placeholder="you@example.com"
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email ? (
                        <p className="mt-1.5 text-xs font-medium text-rose-600">
                          {errors.email.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="label-base">
                      Subject
                    </label>
                    <input
                      id="subject"
                      {...register('subject')}
                      className="input-base"
                      placeholder="How can we help?"
                      aria-invalid={Boolean(errors.subject)}
                    />
                    {errors.subject ? (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">
                        {errors.subject.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="ward" className="label-base">
                      Ward / area (optional)
                    </label>
                    <input
                      id="ward"
                      {...register('ward')}
                      className="input-base"
                      placeholder="e.g. Koramangala"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="label-base">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      {...register('message')}
                      className="input-base resize-none"
                      placeholder="Tell us what\u2019s on your mind…"
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message ? (
                      <p className="mt-1.5 text-xs font-medium text-rose-600">
                        {errors.message.message}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Send className="h-4 w-4 animate-pulse" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
