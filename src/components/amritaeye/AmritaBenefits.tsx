import { Eye, Zap, Users, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 150, scale: 0.8, filter: "blur(12px)" },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: 'spring', duration: 1.8, bounce: 0.4 }
  }
};

export function AmritaBenefits() {
  return (
    <section className="bg-[#FFF5F7] dark:bg-[#1A030A] py-24 sm:py-36 border-t border-[#A51636]/10 dark:border-[#E52B50]/10">
      <div className="mx-auto max-w-[1920px] px-6 lg:px-12">
        <div className="mb-16">
          <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A51636] dark:text-[#E52B50]">
            <span className="h-2 w-2 rounded-full bg-[#A51636] dark:bg-[#E52B50]" aria-hidden="true" />
            <span>Core Benefits</span>
          </div>
          <h2 className="text-4xl sm:text-[56px] font-bold leading-[1.1] tracking-tight text-neutral-900 dark:text-white max-w-3xl">
            A smarter campus, <br />
            <span className="font-serif italic font-normal text-[#A51636] dark:text-[#E52B50]">built by everyone.</span>
          </h2>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Main Bento Box */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-2 flex flex-col justify-between rounded-3xl bg-[#F5F5F7] dark:bg-[#161618] p-8 sm:p-12 border border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 transition-opacity group-hover:opacity-20">
              <Eye className="h-32 w-32 text-neutral-900 dark:text-white" />
            </div>
            <div className="mb-24 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-[#0D0105] shadow-sm z-10">
              <Eye className="h-7 w-7 text-[#A51636] dark:text-[#E52B50]" />
            </div>
            <div className="z-10 max-w-lg">
              <h3 className="mb-4 text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-[1.2]">
                Instant visibility
              </h3>
              <p className="text-lg leading-[1.6] text-neutral-600 dark:text-neutral-400">
                Know exactly what's happening on campus right now, without waiting for emails or manual reports to be processed.
              </p>
            </div>
          </motion.div>

          {/* Side Bento 1 */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col justify-between rounded-3xl bg-[#F5F5F7] dark:bg-[#161618] p-8 sm:p-12 border border-neutral-200/50 dark:border-neutral-800/50"
          >
            <div className="mb-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#0D0105] shadow-sm">
              <Zap className="h-6 w-6 text-neutral-900 dark:text-white" />
            </div>
            <div>
              <h3 className="mb-3 text-[24px] font-bold text-neutral-900 dark:text-white leading-[1.2]">
                Targeted resolution
              </h3>
              <p className="text-base leading-[1.6] text-neutral-600 dark:text-neutral-400">
                Route issues directly to the right department, cutting response times from days to hours.
              </p>
            </div>
          </motion.div>

          {/* Side Bento 2 */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col justify-between rounded-3xl bg-[#A51636] dark:bg-[#E52B50] p-8 sm:p-12 text-white relative overflow-hidden"
          >
            <div className="absolute -bottom-6 -right-6 opacity-20">
              <Users className="h-40 w-40" />
            </div>
            <div className="mb-16 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md z-10">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="z-10">
              <h3 className="mb-3 text-[24px] font-bold leading-[1.2]">
                Community driven
              </h3>
              <p className="text-base leading-[1.6] text-white/80">
                Empower students and faculty to take ownership and make their campus better together.
              </p>
            </div>
          </motion.div>

          {/* Bottom Full Span Bento */}
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-2 flex flex-col justify-between rounded-3xl bg-[#F5F5F7] dark:bg-[#161618] p-8 sm:p-12 border border-neutral-200/50 dark:border-neutral-800/50"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#0D0105] shadow-sm">
                  <MapPin className="h-6 w-6 text-[#A51636] dark:text-[#E52B50]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-[1.2]">
                    Pinpoint Accuracy
                  </h3>
                  <p className="text-sm leading-[1.6] text-neutral-600 dark:text-neutral-400 mt-1">
                    Exact coordinates mean no more wandering maintenance crews.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-[#0D0105] shadow-sm">
                  <ShieldCheck className="h-6 w-6 text-[#A51636] dark:text-[#E52B50]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-[1.2]">
                    Verified Reports
                  </h3>
                  <p className="text-sm leading-[1.6] text-neutral-600 dark:text-neutral-400 mt-1">
                    Upvotes by other students prevent duplicate logs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
