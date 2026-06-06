import { useEffect, useRef, useState } from "react";

type Props = {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
};

const AnimatedCounter = ({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2000,
}: Props) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, target, duration, decimals]);

  const display =
    decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toString();

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
