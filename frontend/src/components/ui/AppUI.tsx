import type { ReactNode } from "react";
import ThemeToggle from "../ThemeToggle";

export const AppPage = ({
  children,
  className = "",
  narrow = false,
}: {
  children: ReactNode;
  className?: string;
  narrow?: boolean;
}) => (
  <div
    className={`min-h-[calc(100vh-4rem)] bg-gradient-to-b from-gray-50 via-white to-red-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 ${className}`}
  >
    <div
      className={`mx-auto px-4 py-6 ${narrow ? "max-w-3xl" : "max-w-7xl"}`}
    >
      {children}
    </div>
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="text-xs font-bold uppercase tracking-widest text-[#E23744]">
        {eyebrow}
      </p>
    )}
    <h1 className="mt-1 text-2xl font-black tracking-tight text-gray-900 dark:text-white md:text-3xl">
      {title}
    </h1>
    {subtitle && (
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        {subtitle}
      </p>
    )}
  </div>
);

export const AppCard = ({
  children,
  className = "",
  hover = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    role={onClick ? "button" : undefined}
    className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none ${
      hover || onClick
        ? "cursor-pointer transition hover:border-[#E23744]/15 hover:shadow-md hover:shadow-[#E23744]/5 dark:hover:border-[#E23744]/25 dark:hover:bg-gray-800/80"
        : ""
    } ${className}`}
  >
    {children}
  </div>
);

export const LoadingScreen = ({
  message = "Loading...",
}: {
  message?: string;
}) => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="text-center">
      <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-[#E23744] border-t-transparent" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  </div>
);

export const EmptyState = ({
  emoji = "🍽️",
  title,
  subtitle,
  action,
  variant = "default",
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  variant?: "default" | "success" | "search";
}) => {
  const styles = {
    default: {
      bg: "from-white via-gray-50/80 to-red-50/40 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-950",
      ring: "from-[#E23744]/20 to-orange-200/30 dark:from-[#E23744]/30 dark:to-orange-900/20",
      iconBg:
        "from-[#E23744]/10 to-orange-100/50 dark:from-[#E23744]/20 dark:to-orange-950/40",
      glow: "bg-[#E23744]/10 dark:bg-[#E23744]/15",
    },
    success: {
      bg: "from-emerald-50/80 via-white to-teal-50/30 dark:from-emerald-950/40 dark:via-gray-900 dark:to-teal-950/30",
      ring: "from-emerald-400/25 to-teal-300/20 dark:from-emerald-500/20 dark:to-teal-800/20",
      iconBg:
        "from-emerald-100 to-teal-50 dark:from-emerald-900/50 dark:to-teal-950/50",
      glow: "bg-emerald-400/15 dark:bg-emerald-500/10",
    },
    search: {
      bg: "from-white via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20",
      ring: "from-blue-400/20 to-indigo-200/25 dark:from-blue-500/20 dark:to-indigo-800/20",
      iconBg:
        "from-blue-50 to-indigo-100/50 dark:from-blue-950/50 dark:to-indigo-950/50",
      glow: "bg-blue-400/10 dark:bg-blue-500/10",
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-gray-100/80 bg-gradient-to-br ${styles.bg} px-8 py-14 text-center shadow-sm dark:border-gray-800`}
    >
      <div
        className={`pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full ${styles.glow} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full ${styles.glow} blur-3xl`}
      />

      <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
        <div
          className={`absolute inset-0 animate-pulse rounded-full bg-gradient-to-br ${styles.ring} opacity-60`}
        />
        <div
          className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br ${styles.iconBg} shadow-lg shadow-gray-200/50 ring-1 ring-white/80 dark:shadow-none dark:ring-gray-700/80`}
        >
          <span className="text-4xl drop-shadow-sm">{emoji}</span>
        </div>
      </div>

      <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}

      {variant === "success" && (
        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Queue is clear
        </div>
      )}

      {action && <div className="relative mt-8">{action}</div>}
    </div>
  );
};

const btnBase =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export const AppButton = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "dark" | "ghost" | "danger";
}) => {
  const variants = {
    primary:
      "bg-[#E23744] text-white hover:bg-[#c9303c] shadow-sm shadow-[#E23744]/25",
    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-700",
    dark: "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white",
    ghost:
      "text-[#E23744] hover:bg-red-50 dark:text-[#ff6b7a] dark:hover:bg-red-950/40",
    danger:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60",
  };
  return (
    <button
      className={`${btnBase} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const AppInput = ({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#E23744]/40 focus:ring-2 focus:ring-[#E23744]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#E23744]/50 ${className}`}
    {...props}
  />
);

export const StatusBadge = ({ status }: { status: string }) => {
  const s = status.toLowerCase();
  let style = "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  if (["delivered", "completed"].includes(s))
    style = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400";
  else if (["cancelled", "rejected"].includes(s))
    style = "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400";
  else if (["placed", "accepted"].includes(s))
    style = "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
  else if (["preparing", "ready_for_rider", "picked_up"].includes(s))
    style = "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";
  else if (["rider_assigned"].includes(s))
    style = "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export const RoleShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-red-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <header className="border-b border-gray-100 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍔</span>
          <span className="text-xl font-black text-gray-900 dark:text-white">
            Byte<span className="text-[#E23744]">Bites</span>
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
    <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
  </div>
);

export const AppTabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) => (
  <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
    {tabs.map((t) => (
      <button
        key={t.key}
        type="button"
        onClick={() => onChange(t.key)}
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
          active === t.key
            ? "bg-white text-[#E23744] shadow-sm dark:bg-gray-900 dark:text-[#ff6b7a]"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);
