import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";

export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
};

const FaqAccordion = ({ items }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto mt-12 max-w-3xl space-y-3">
      {items.map(({ question, answer }, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={question}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? "border-[#E23744]/30 bg-[#E23744]/5 shadow-lg shadow-[#E23744]/5"
                : "border-white/5 bg-white/[0.02] hover:border-white/10"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-white">{question}</span>
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-300 ${
                  isOpen ? "rotate-180 bg-[#E23744]/20 border-[#E23744]/30" : ""
                }`}
              >
                <BiChevronDown className="h-5 w-5 text-gray-400" />
              </span>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-gray-400">
                  {answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
