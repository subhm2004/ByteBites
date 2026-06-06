import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { BiStore, BiBoltCircle, BiStar, BiChat } from "react-icons/bi";
import AnimatedCounter from "./AnimatedCounter";

type StatItem = {
  icon: IconType;
  iconColor: string;
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  glow: string;
  ring: string;
  bg: string;
};

const stats: StatItem[] = [
  {
    icon: BiStore,
    iconColor: "text-[#E23744]",
    target: 500,
    suffix: "+",
    label: "Restaurants",
    bg: "bg-[#E23744]/10",
    ring: "ring-[#E23744]/25",
    glow: "bg-[#E23744]/20",
  },
  {
    icon: BiBoltCircle,
    iconColor: "text-amber-400",
    target: 30,
    suffix: " min",
    label: "Delivery",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/25",
    glow: "bg-amber-500/20",
  },
  {
    icon: BiStar,
    iconColor: "text-yellow-400",
    target: 4.9,
    suffix: "★",
    decimals: 1,
    label: "Rating",
    bg: "bg-yellow-500/10",
    ring: "ring-yellow-500/25",
    glow: "bg-yellow-500/20",
  },
  {
    icon: BiChat,
    iconColor: "text-emerald-400",
    target: 12.5,
    suffix: "K+",
    decimals: 1,
    label: "Reviews",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/25",
    glow: "bg-emerald-500/20",
  },
];

const StatCard = ({
  stat,
  index,
  visible,
}: {
  stat: StatItem;
  index: number;
  visible: boolean;
}) => {
  const {
    icon: Icon,
    iconColor,
    target,
    suffix,
    prefix,
    decimals,
    label,
    bg,
    ring,
    glow,
  } = stat;

  return (
    <div
      className={`group relative flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-black/20 sm:gap-4 sm:px-6 sm:py-5 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: visible ? `${index * 80}ms` : "0ms" }}
    >
      <div
        className={`pointer-events-none absolute -right-3 -top-3 h-14 w-14 rounded-full ${glow} blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${bg} ${ring} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>

      <div className="relative">
        <p className="whitespace-nowrap text-2xl font-black leading-none tracking-tight text-white sm:text-[1.75rem]">
          <AnimatedCounter
            target={target}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals ?? 0}
            duration={1800}
          />
        </p>
        <p className="mt-1.5 whitespace-nowrap text-xs font-medium text-gray-500">
          {label}
        </p>
      </div>
    </div>
  );
};

const HeroStats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} visible={visible} />
        ))}
      </div>
    </div>
  );
};

export default HeroStats;
