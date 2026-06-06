import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BiRightArrowAlt } from "react-icons/bi";
import type { IconType } from "react-icons";

export type Role = {
  icon: IconType;
  title: string;
  desc: string;
  cta: string;
  stat: string;
  statLabel: string;
  perks: string[];
  color: string;
  iconBg: string;
  glow: string;
  borderHover: string;
};

type Props = {
  roles: Role[];
};

const RoleCard = ({
  role,
  index,
  visible,
}: {
  role: Role;
  index: number;
  visible: boolean;
}) => {
  const {
    icon: Icon,
    title,
    desc,
    cta,
    stat,
    statLabel,
    perks,
    color,
    iconBg,
    glow,
    borderHover,
  } = role;

  return (
    <Link
      to="/login"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${color} p-7 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl ${borderHover} ${
        visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: visible ? `${index * 120}ms` : "0ms" }}
    >
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full ${glow} blur-3xl opacity-40 transition-opacity duration-500 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconBg} shadow-lg ring-1 ring-white/10 transition duration-300 group-hover:scale-110`}
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

      <h3 className="relative mt-6 text-xl font-bold text-white">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-gray-400">{desc}</p>

      <ul className="relative mt-5 space-y-2">
        {perks.map((perk) => (
          <li key={perk} className="flex items-center gap-2 text-xs text-gray-400">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E23744]" />
            {perk}
          </li>
        ))}
      </ul>

      <div className="relative mt-6 flex items-center gap-2 text-sm font-bold text-[#E23744] transition group-hover:gap-3">
        {cta}
        <BiRightArrowAlt className="h-5 w-5 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

const RoleCards = ({ roles }: Props) => {
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
    <div ref={ref} className="grid gap-5 md:grid-cols-3">
      {roles.map((role, i) => (
        <RoleCard key={role.title} role={role} index={i} visible={visible} />
      ))}
    </div>
  );
};

export default RoleCards;
