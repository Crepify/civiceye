export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
  gradient: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Ananya Rao',
    role: 'Daily commuter, Indiranagar',
    quote:
      'The pothole on 12th Main was a nightmare for two months. I reported it on CivicEye on a Monday — it was fixed the same week. I could track the whole journey.',
    initials: 'AR',
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    name: 'Ravi Shankar',
    role: 'Community volunteer, Koramangala',
    quote:
      'Our residents group now logs every street-light outage in one place. The ward officer actually reviews the verified reports. It finally feels like we are being heard.',
    initials: 'RS',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    name: 'Dr. Meera Krishnan',
    role: 'Pediatrician, HSR Layout',
    quote:
      'The open manhole near our clinic was a danger to kids. CivicEye\u2019s verified status pushed it to the top of the BBMP queue. Fixed in three days.',
    initials: 'MK',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    name: 'Arjun Nair',
    role: 'Cyclist, Whitefield',
    quote:
      'I use the heatmap to plan safer routes home. It is brilliant that citizens rate the severity — you know exactly where to slow down after the rain.',
    initials: 'AN',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    name: 'Sneha Iyer',
    role: 'Product manager, MG Road',
    quote:
      'Submitting a report takes less than a minute. The QR photo flow is slick — I snap it on my phone and it appears on my laptop instantly.',
    initials: 'SI',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    name: 'Karthik Reddy',
    role: 'NGO partner, Jayanagar',
    quote:
      'The authority dashboard gives our volunteers a weekly digest of every ward. We can finally measure whether things actually get fixed.',
    initials: 'KR',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
];
