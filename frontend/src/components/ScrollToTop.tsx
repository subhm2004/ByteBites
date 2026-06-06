import { useEffect, useState } from "react";
import { BiChevronUp } from "react-icons/bi";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#080808]/90 text-white shadow-lg shadow-black/40 backdrop-blur-md transition-all duration-300 hover:border-[#E23744]/50 hover:bg-[#E23744] hover:shadow-[#E23744]/30 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <BiChevronUp className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTop;
