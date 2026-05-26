"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What is your typical turnaround time for a project?",
    answer: "Typically, the first draft is delivered within 3 to 5 business days, depending on the complexity of the project. High-end cinematic edits or short-form packages may have different timelines, which we will agree upon before starting.",
  },
  {
    question: "What software and tools do you use for editing?",
    answer: "I use industry-standard software such as Adobe Premiere Pro, After Effects, and DaVinci Resolve. This allows me to deliver high-quality cinematic edits, motion graphics, and advanced color grading.",
  },
  {
    question: "Are sound design and color grading included in your rate?",
    answer: "Yes, all my editing packages include professional color grading and custom sound design to ensure the final product is cohesive, immersive, and cinematic.",
  },
  {
    question: "How do we collaborate and handle project revisions?",
    answer: "We typically collaborate via Frame.io or email for feedback. Most projects include up to two rounds of minor revisions to ensure you are completely satisfied with the final cut.",
  },
  {
    question: "How should I send my raw footage to you?",
    answer: "You can send your raw footage and assets via a secure cloud link, such as Google Drive, Dropbox, or WeTransfer. I will provide a dedicated folder for your project.",
  },
  {
    question: "What are your payment terms for custom editing work?",
    answer: "I require a 50% deposit upfront before beginning work, with the remaining balance due upon final approval of the project. Payments can be made via standard invoicing.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section 
      id="faq" 
      className="min-h-[100dvh] flex flex-col justify-center py-24 relative z-10 bg-black text-white w-full"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 w-full">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold block mb-3">
              FAQ
            </span>
            <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tight leading-[0.9] text-white">
              Frequently<br />Asked Questions
            </h2>
          </div>
        </div>

        {/* FAQ List */}
        <div className="border-t border-white/10">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const qNumber = `Q${index + 1}`;
            
            return (
              <div
                key={index}
                className="border-b border-white/10 transition-colors duration-300"
                onMouseEnter={() => setOpenIndex(index)}
                onMouseLeave={() => setOpenIndex(null)}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between py-6 md:py-8 group focus:outline-none text-left"
                >
                  <div className="flex items-center gap-8 md:gap-16 w-full">
                    {/* Q Number */}
                    <span className="text-gray-500 font-medium text-sm md:text-base w-8">
                      {qNumber}
                    </span>
                    
                    {/* Question Text */}
                    <span className={`text-base md:text-lg lg:text-xl font-medium transition-colors duration-200 flex-1 pr-4 ${isOpen ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
                      {item.question}
                    </span>
                  </div>
                  
                  {/* Chevron */}
                  <span className={`text-gray-500 transition-transform duration-300 transform ${isOpen ? "rotate-90" : ""}`}>
                    <ChevronRight size={16} />
                  </span>
                </button>

                {/* Answer Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-[4rem] md:pl-[6rem] pr-8 text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
