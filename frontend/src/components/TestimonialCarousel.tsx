import { useState } from "react";
import { BiStar } from "react-icons/bi";
import { FaQuoteLeft } from "react-icons/fa6";

export type Testimonial = {
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
};

type Props = {
  testimonials: Testimonial[];
};

type RowProps = {
  items: Testimonial[];
  direction: "ltr" | "rtl";
  paused: boolean;
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <BiStar
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-white/10 text-white/20"
        }`}
      />
    ))}
  </div>
);

const TestimonialCard = ({ name, role, text, avatar, rating }: Testimonial) => (
  <div className="w-[300px] flex-shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-5 shadow-lg shadow-black/20 transition hover:border-[#E23744]/30 sm:w-[340px]">
    <div className="flex items-start justify-between gap-3">
      <FaQuoteLeft className="h-5 w-5 shrink-0 text-[#E23744]/60" />
      <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1 ring-1 ring-yellow-400/25">
        <BiStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-black text-yellow-400">{rating}.0</span>
      </div>
    </div>

    <p className="mt-3 min-h-[64px] text-sm leading-relaxed text-gray-300">
      &ldquo;{text}&rdquo;
    </p>

    <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E23744] to-orange-600 text-sm font-bold text-white ring-2 ring-[#E23744]/30">
        {avatar}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-gray-500">{role}</p>
      </div>
      <StarRating rating={rating} />
    </div>
  </div>
);

const TestimonialRow = ({ items, direction, paused }: RowProps) => {
  const loopItems = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#080808] to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#080808] to-transparent sm:w-16" />

      <div
        className={`testimonial-marquee-track flex w-max gap-4 py-1 sm:gap-5 ${
          direction === "ltr" ? "testimonial-marquee-ltr" : "testimonial-marquee-rtl"
        } ${paused ? "testimonial-marquee-paused" : ""}`}
        style={{ animationDuration: `${Math.max(items.length * 9, 36)}s` }}
      >
        {loopItems.map((item, i) => (
          <TestimonialCard key={`${item.name}-${i}`} {...item} />
        ))}
      </div>
    </div>
  );
};

const TestimonialCarousel = ({ testimonials }: Props) => {
  const [paused, setPaused] = useState(false);
  const midpoint = Math.ceil(testimonials.length / 2);
  const topRow = testimonials.slice(0, midpoint);
  const bottomRow = testimonials.slice(midpoint);

  return (
    <div
      className="mt-12 space-y-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TestimonialRow items={topRow} direction="ltr" paused={paused} />
      <TestimonialRow items={bottomRow} direction="rtl" paused={paused} />
    </div>
  );
};

export default TestimonialCarousel;
