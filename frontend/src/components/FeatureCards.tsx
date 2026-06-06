import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";

export type Feature = {
  icon: IconType;
  title: string;
  desc: string;
  stat: string;
  statLabel: string;
  color: string;
  iconBg: string;
  glow: string;
};

type Props = {
  features: Feature[];
};

const FeatureCard = ({
  feature,
  index,
  visible,
}: {
  feature: Feature;
  index: number;
  visible: boolean;
}) => {
  const { icon: Icon, title, desc, stat, statLabel, color, iconBg, glow } =
    feature;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#E23744]/30 hover:shadow-xl hover:shadow-[#E23744]/10 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: visible ? `${index * 100}ms` : "0ms" }}
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full ${glow} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} ring-1 ring-white/10 transition duration-300 group-hover:scale-110 group-hover:ring-[#E23744]/40`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-black leading-none text-white">{stat}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            {statLabel}
          </p>
        </div>
      </div>

      <h3 className="relative mt-5 text-lg font-bold text-white">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-gray-400">
        {desc}
      </p>

      <div className="relative mt-5 h-0.5 w-0 rounded-full bg-gradient-to-r from-[#E23744] to-orange-500 transition-all duration-500 group-hover:w-full" />
    </div>
  );
};

const FeatureCards = ({ features }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, i) => (
        <FeatureCard key={feature.title} feature={feature} index={i} visible={visible} />
      ))}
    </div>
  );
};

export default FeatureCards;
