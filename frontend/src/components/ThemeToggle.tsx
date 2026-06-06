import { BiMoon, BiSun } from "react-icons/bi";
import { useTheme } from "../context/ThemeContext";

type ThemeToggleProps = {
  className?: string;
  size?: "sm" | "md";
};

const ThemeToggle = ({ className = "", size = "md" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? 18 : 20;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={`flex ${dim} shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-[#E23744]/30 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:text-amber-300 dark:hover:border-[#E23744]/40 dark:hover:bg-gray-700 ${className}`}
    >
      {theme === "dark" ? (
        <BiSun size={iconSize} />
      ) : (
        <BiMoon size={iconSize} />
      )}
    </button>
  );
};

export default ThemeToggle;
