import { useEffect, useRef, useState } from "react";
import { BiChevronRight } from "react-icons/bi";

export type Step = {
  num: string;
  emoji: string;
  title: string;
  desc: string;
  time: string;
  timeLabel: string;
};

type Props = {
  steps: Step[];
};

const accents = [
  {
    icon: "from-[#E23744] via-[#ff4757] to-orange-500",
    shadow: "shadow-[#E23744]/50",
    ring: "ring-[#E23744]/30",
    badge: "text-[#ff9a9a]",
    dot: "bg-[#E23744]",
  },
  {
    icon: "from-orange-500 via-amber-500 to-yellow-500",
    shadow: "shadow-orange-500/50",
    ring: "ring-orange-500/30",
    badge: "text-orange-300",
    dot: "bg-orange-500",
  },
  {
    icon: "from-green-500 via-emerald-500 to-teal-500",
    shadow: "shadow-green-500/50",
    ring: "ring-green-500/30",
    badge: "text-green-300",
    dot: "bg-green-500",
  },
];

const StepCard = ({
  step,
  index,
  visible,
}: {
  step: Step;
  index: number;
  visible: boolean;
}) => {
  const { num, emoji, title, desc, time, timeLabel } = step;
  const accent = accents[index % accents.length];

  return (
    <div
      className={`group relative flex flex-col items-center transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      }`}
      style={{ transitionDelay: visible ? `${index * 180}ms` : "0ms" }}
    >
      {/* Icon cluster */}
      <div className="relative mb-8">
        <span
          className={`absolute inset-0 rounded-3xl border-2 border-white/10 ${accent.ring} animate-ring-pulse`}
        />
        <span
          className={`absolute inset-0 rounded-3xl border-2 border-white/5 ${accent.ring} animate-ring-pulse-delay`}
        />
        <div
          className={`absolute inset-0 rounded-3xl ${accent.dot} opacity-20 blur-2xl transition duration-500 group-hover:opacity-40`}
        />

        <div
          className={`animate-icon-float relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${accent.icon} text-5xl ${accent.shadow} shadow-2xl ring-4 ring-white/10 transition duration-500 group-hover:scale-110 group-hover:rotate-3`}
          style={{ animationDelay: `${index * 0.4}s` }}
        >
          {emoji}
          <span className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#080808]/90 text-sm font-black text-white shadow-xl backdrop-blur-sm ring-2 ring-[#E23744]/50">
            {num}
          </span>
        </div>
      </div>

      {/* Glass card with gradient border */}
      <div className="how-step-border w-full max-w-[280px] rounded-2xl p-[1px]">
        <div className="rounded-2xl bg-[#0a0a0a]/80 p-6 backdrop-blur-xl transition duration-500 group-hover:bg-[#0f0f0f]/90">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5">
            <span className={`relative flex h-2 w-2 ${accent.dot} rounded-full`}>
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${accent.dot} opacity-75`}
              />
            </span>
            <span className={`text-sm font-black ${accent.badge}`}>{time}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              {timeLabel}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white transition group-hover:text-[#ff9a9a]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{desc}</p>

          <div className="mt-5 overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-1 rounded-full ${accent.dot} transition-all duration-700 group-hover:w-full`}
              style={{ width: visible ? "100%" : "0%", transitionDelay: `${index * 200 + 400}ms` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const HowItWorksSteps = ({ steps }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [lineWidth, setLineWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setTimeout(() => setLineWidth(100), 400);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative mt-20">
      {/* Desktop connector track */}
      <div className="absolute top-14 left-[18%] right-[18%] hidden md:block">
        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/5">
          <div
            className="how-line-shimmer h-full rounded-full transition-all duration-[1.4s] ease-out"
            style={{ width: `${lineWidth}%` }}
          />
          {lineWidth >= 100 && (
            <div className="animate-travel-dot absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_16px_#E23744,0_0_32px_#E23744]" />
          )}
        </div>

        {/* Step dots on line */}
        <div className="absolute -top-1 left-0 flex w-full justify-between px-[2%]">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={`h-3.5 w-3.5 rounded-full border-2 border-[#080808] transition-all duration-500 ${
                visible ? "scale-100 opacity-100" : "scale-0 opacity-0"
              } ${accents[i].dot}`}
              style={{ transitionDelay: `${i * 200 + 600}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Arrows between steps — desktop */}
      <div className="pointer-events-none absolute top-[4.5rem] hidden w-full md:block">
        <div className="mx-auto flex max-w-4xl justify-between px-[28%]">
          {[0, 1].map((i) => (
            <BiChevronRight
              key={i}
              className={`h-8 w-8 text-[#E23744]/40 transition-all duration-700 ${
                visible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
              }`}
              style={{ transitionDelay: `${i * 300 + 800}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-14 md:grid-cols-3 md:gap-6">
        {steps.map((step, i) => (
          <StepCard key={step.num} step={step} index={i} visible={visible} />
        ))}
      </div>
    </div>
  );
};

export default HowItWorksSteps;
