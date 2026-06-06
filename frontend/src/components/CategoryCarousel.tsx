import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

export type Category = {
  name: string;
  emoji: string;
  img: string;
};

type Props = {
  categories: Category[];
};

const SCROLL_SPEED = 0.7;
const CARD_SCROLL = 260;

const CategoryCard = ({ name, emoji, img }: Category) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to="/login"
      className="group relative aspect-[4/5] w-[44vw] max-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 transition hover:scale-[1.03] hover:ring-[#E23744]/50 sm:w-[32vw] md:w-[24vw] lg:w-[19vw] xl:w-[16vw]"
    >
      {!imgError ? (
        <img
          src={img}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E23744]/30 to-orange-900/40">
          <span className="text-6xl">{emoji}</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <span className="text-2xl">{emoji}</span>
        <p className="mt-1 font-bold text-white">{name}</p>
      </div>
    </Link>
  );
};

const CategoryCarousel = ({ categories }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const loopItems = [...categories, ...categories];

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frameId: number;

    const tick = () => {
      if (!pausedRef.current) {
        el.scrollLeft += SCROLL_SPEED;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [categories.length]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -CARD_SCROLL : CARD_SCROLL,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="relative mt-12 w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#080808] to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#080808] to-transparent sm:w-14" />

      <button
        type="button"
        onClick={() => scroll("left")}
        aria-label="Scroll categories left"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#080808]/90 text-white shadow-lg backdrop-blur-sm transition hover:border-[#E23744]/50 hover:bg-[#E23744]/20 sm:left-5 sm:h-11 sm:w-11"
      >
        <BiChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={() => scroll("right")}
        aria-label="Scroll categories right"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#080808]/90 text-white shadow-lg backdrop-blur-sm transition hover:border-[#E23744]/50 hover:bg-[#E23744]/20 sm:right-5 sm:h-11 sm:w-11"
      >
        <BiChevronRight className="h-6 w-6" />
      </button>

      <div
        ref={scrollRef}
        className="category-carousel-scroll flex gap-3 overflow-x-hidden py-1 sm:gap-4"
      >
        {loopItems.map((cat, i) => (
          <CategoryCard key={`${cat.name}-${i}`} {...cat} />
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
