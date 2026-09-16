import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    title: "Snap a photo",
    description: "Spot a broken light, leak, or hazard? Take a clear photo of the issue."
  },
  {
    number: "02",
    title: "Tag the location",
    description: "Drop a pin on the campus map so the maintenance team knows exactly where to go."
  },
  {
    number: "03",
    title: "Watch it get resolved",
    description: "Track the status of your report in real time as the issue gets fixed."
  }
];

export function AmritaHowItWorks() {
  return (
    <section className="bg-[#FFF5F7] dark:bg-[#1A030A] py-24 sm:py-36 border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
      <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
        <div className="mb-24 md:mb-32">
          <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A51636] dark:text-[#E52B50]">
            <span className="h-2 w-2 rounded-full bg-[#A51636] dark:bg-[#E52B50]" aria-hidden="true" />
            <span>How it works</span>
          </div>
          <h2 className="max-w-4xl text-5xl sm:text-[72px] font-bold leading-[1.05] tracking-[-0.03em] text-neutral-900 dark:text-white">
            Report issues in <span className="font-serif italic font-normal text-[#A51636] dark:text-[#E52B50]">three simple steps.</span>
          </h2>
        </div>

        <div className="relative border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="grid grid-cols-1 gap-8 md:grid-cols-12 py-16 border-b border-[#A51636]/10 dark:border-[#E52B50]/10"
              initial={{ opacity: 0, y: 100, scale: 0.9, filter: "blur(8px)", rotate: -2 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: 'spring', duration: 1.5, bounce: 0.4 }}
            >
              <div className="md:col-span-5 md:sticky md:top-32 self-start relative">
                <motion.span 
                  className="text-[72px] lg:text-[72px] font-serif italic leading-none tracking-tighter text-[#A51636]/10 dark:text-[#E52B50]/10 select-none inline-block origin-left"
                  initial={{ scale: 2, opacity: 0, filter: "blur(8px)", x: -100 }}
                  whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)", x: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 1.5, delay: 0.2 }}
                >
                  {step.number}
                </motion.span>
                <div className="absolute inset-0 flex items-center pt-8 pl-4 lg:pt-16 lg:pl-8 pointer-events-none">
                  <motion.h3 
                    className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1]"
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.4 }}
                  >
                    {step.title}
                  </motion.h3>
                </div>
              </div>
              
              <div className="md:col-span-7 flex items-center">
                <motion.p 
                  className="text-xl sm:text-2xl leading-[1.6] text-neutral-600 dark:text-neutral-400 max-w-2xl"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 1, delay: 0.5 }}
                >
                  {step.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
