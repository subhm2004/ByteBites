import { Link } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BiBoltCircle,
  BiMapPin,
  BiShield,
  BiRestaurant,
  BiRightArrowAlt,
  BiStore,
  BiCycling,
  BiX,
  BiUser,
} from "react-icons/bi";
import { FaInstagram, FaTwitter, FaGithub } from "react-icons/fa6";
import { MdDeliveryDining, MdOutlineDeliveryDining } from "react-icons/md";
import { HiOutlineSparkles, HiOutlineFire } from "react-icons/hi2";
import IphoneMockup from "../components/IphoneMockup";
import HeroStats from "../components/HeroStats";
import AnimatedCounter from "../components/AnimatedCounter";
import CategoryCarousel from "../components/CategoryCarousel";
import TestimonialCarousel from "../components/TestimonialCarousel";
import FeatureCards from "../components/FeatureCards";
import RoleCards from "../components/RoleCards";
import HowItWorksSteps from "../components/HowItWorksSteps";
import FaqAccordion from "../components/FaqAccordion";
import ScrollToTop from "../components/ScrollToTop";

const features = [
  {
    icon: BiBoltCircle,
    title: "Lightning Fast",
    desc: "Hot food at your door — tracked live from kitchen to doorstep.",
    stat: "30 min",
    statLabel: "Avg delivery",
    color: "from-yellow-500/15 via-white/[0.03] to-transparent",
    iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
    glow: "bg-yellow-500/30",
  },
  {
    icon: BiMapPin,
    title: "Live Tracking",
    desc: "Watch your rider move on the map in real time. No guessing.",
    stat: "Live",
    statLabel: "GPS updates",
    color: "from-green-500/15 via-white/[0.03] to-transparent",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    glow: "bg-green-500/30",
  },
  {
    icon: BiShield,
    title: "Secure Payments",
    desc: "Razorpay & Stripe — pay safely with UPI, cards, or wallets.",
    stat: "100%",
    statLabel: "Encrypted",
    color: "from-blue-500/15 via-white/[0.03] to-transparent",
    iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    glow: "bg-blue-500/30",
  },
  {
    icon: BiRestaurant,
    title: "Top Restaurants",
    desc: "Curated local spots with verified menus and fresh food.",
    stat: "500+",
    statLabel: "Partners",
    color: "from-[#E23744]/15 via-white/[0.03] to-transparent",
    iconBg: "bg-gradient-to-br from-[#E23744] to-red-600",
    glow: "bg-[#E23744]/30",
  },
];

const steps = [
  {
    num: "01",
    emoji: "🔍",
    title: "Browse & Order",
    desc: "Pick your favourite restaurant, add to cart, choose address.",
    time: "30 sec",
    timeLabel: "to browse",
  },
  {
    num: "02",
    emoji: "💳",
    title: "Pay Securely",
    desc: "Checkout with Razorpay or Stripe — quick & encrypted.",
    time: "1 tap",
    timeLabel: "UPI pay",
  },
  {
    num: "03",
    emoji: "🛵",
    title: "Track & Enjoy",
    desc: "Follow your order live until it arrives at your door.",
    time: "Live",
    timeLabel: "GPS track",
  },
];

const reviewStats = [
  { target: 4.9, suffix: "★", label: "Average Rating", decimals: 1 },
  { target: 12500, suffix: "+", label: "Total Reviews", decimals: 0 },
  { target: 98, suffix: "%", label: "Would Recommend", decimals: 0 },
  { target: 50, suffix: "K+", label: "Active Users", decimals: 0 },
];

const categories = [
  {
    name: "Pizza",
    emoji: "🍕",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80",
  },
  {
    name: "Burgers",
    emoji: "🍔",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
  },
  {
    name: "Sushi",
    emoji: "🍣",
    img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80",
  },
  {
    name: "Biryani",
    emoji: "🍛",
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80",
  },
  {
    name: "Desserts",
    emoji: "🍰",
    img: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80",
  },
  {
    name: "Coffee",
    emoji: "☕",
    img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  },
  {
    name: "Noodles",
    emoji: "🍜",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80",
  },
  {
    name: "Tacos",
    emoji: "🌮",
    img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80",
  },
  {
    name: "Salads",
    emoji: "🥗",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  },
  {
    name: "Ice Cream",
    emoji: "🍦",
    img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80",
  },
  {
    name: "Pasta",
    emoji: "🍝",
    img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
  },
  {
    name: "Chinese",
    emoji: "🥡",
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80",
  },
  {
    name: "South Indian",
    emoji: "🥘",
    img: "https://images.unsplash.com/photo-1743615467204-8fdaa85ff2db?w=600&q=80",
  },
  {
    name: "Momos",
    emoji: "🥟",
    img: "https://images.unsplash.com/photo-1664990035720-faac522df41f?w=600&q=80",
  },
  {
    name: "Shawarma",
    emoji: "🌯",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80",
  },
  {
    name: "Thali",
    emoji: "🍱",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
  },
  {
    name: "Chole Bhature",
    emoji: "🫓",
    img: "https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=600&q=80",
  },
  {
    name: "Samosas",
    emoji: "🥟",
    img: "https://images.unsplash.com/photo-1772729996007-40bad08b3c40?w=600&q=80",
  },
  {
    name: "Tikki",
    emoji: "🥔",
    img: "https://images.unsplash.com/photo-1599307767316-776533bb941c?w=600&q=80",
  },
  {
    name: "Pani Puri",
    emoji: "🫧",
    img: "https://images.unsplash.com/photo-1760263051313-eb80f321e310?w=600&q=80",
  },
  {
    name: "Daal Makhani",
    emoji: "🍲",
    img: "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=600&q=80",
  },
  {
    name: "Chaap",
    emoji: "🍢",
    img: "https://images.unsplash.com/photo-1697155836215-425794e792cb?w=600&q=80",
  },
  {
    name: "Roll",
    emoji: "🌯",
    img: "https://images.unsplash.com/photo-1660715683691-d1614d1dd361?w=600&q=80",
  },
  {
    name: "Kathi Roll",
    emoji: "🌯",
    img: "https://images.unsplash.com/photo-1707592357743-5e25b277ca36?w=600&q=80",
  },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Food lover · Delhi",
    text: "Ordered paneer tikka on a rainy evening — rider called before arriving and the food was still piping hot. Felt like dining in, not delivery.",
    avatar: "P",
    rating: 5,
  },
  {
    name: "Rahul Mehta",
    role: "Regular customer · Mumbai",
    text: "Craved biryani at 1 AM and it still reached in 28 minutes. Portion size was generous and taste was exactly like the restaurant.",
    avatar: "R",
    rating: 5,
  },
  {
    name: "Ananya Patel",
    role: "Restaurant owner · Ahmedabad",
    text: "New orders show up on my phone right away. Updating the menu is simple and my regulars keep coming back through ByteBites.",
    avatar: "A",
    rating: 5,
  },
  {
    name: "Vikram Singh",
    role: "Delivery rider · Jaipur",
    text: "Customers usually pin the right location, routes are easy to follow, and the team is helpful when something goes wrong.",
    avatar: "V",
    rating: 5,
  },
  {
    name: "Sneha Reddy",
    role: "Working professional · Bangalore",
    text: "Our office orders lunch together almost every day. So many good places nearby and reordering the same meal takes one tap.",
    avatar: "S",
    rating: 5,
  },
  {
    name: "Karan Oberoi",
    role: "College student · Pune",
    text: "Free delivery on my first order was a nice surprise. Split a pizza with friends — hot, cheesy, and worth every rupee.",
    avatar: "K",
    rating: 5,
  },
  {
    name: "Fatima Khan",
    role: "Homemaker · Hyderabad",
    text: "Kids wanted burgers, I wanted biryani — ordered from two places and both arrived around the same time. Saved my evening.",
    avatar: "F",
    rating: 4,
  },
  {
    name: "Dev Kapoor",
    role: "Software engineer · Noida",
    text: "Been using it every weekend for a month. Delivery times are consistent, riders are polite, and the app feels smooth.",
    avatar: "D",
    rating: 5,
  },
];

const roles = [
  {
    icon: BiRestaurant,
    title: "Order Food",
    desc: "Browse top restaurants, add to cart & track your order live on the map.",
    cta: "I'm hungry",
    stat: "2 min",
    statLabel: "To order",
    perks: ["Live GPS tracking", "UPI & card payments", "500+ restaurants"],
    color: "from-[#E23744]/10 via-white/[0.02] to-transparent",
    iconBg: "bg-gradient-to-br from-[#E23744] to-red-600",
    glow: "bg-[#E23744]/40",
    borderHover: "hover:border-[#E23744]/40 hover:shadow-[#E23744]/15",
  },
  {
    icon: BiStore,
    title: "Partner with us",
    desc: "List your restaurant, manage menus & get real-time order alerts.",
    cta: "I'm a seller",
    stat: "Live",
    statLabel: "Order alerts",
    perks: ["Instant notifications", "Easy menu management", "Reach new customers"],
    color: "from-orange-500/10 via-white/[0.02] to-transparent",
    iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
    glow: "bg-orange-500/40",
    borderHover: "hover:border-orange-500/40 hover:shadow-orange-500/15",
  },
  {
    icon: BiCycling,
    title: "Deliver & Earn",
    desc: "Pick deliveries on your schedule, navigate with GPS & earn per trip.",
    cta: "I'm a rider",
    stat: "Flexible",
    statLabel: "Work hours",
    perks: ["Earn per delivery", "Built-in GPS maps", "Instant order requests"],
    color: "from-green-500/10 via-white/[0.02] to-transparent",
    iconBg: "bg-gradient-to-br from-green-500 to-emerald-600",
    glow: "bg-green-500/40",
    borderHover: "hover:border-green-500/40 hover:shadow-green-500/15",
  },
];

const navItems = [
  { label: "Features", id: "features" },
  { label: "Cravings", id: "categories" },
  { label: "How it works", id: "how-it-works" },
  { label: "Reviews", id: "reviews" },
  { label: "FAQ", id: "faq" },
];

const faqItems = [
  {
    question: "How does live order tracking work?",
    answer:
      "Once your order is confirmed, you can see your rider on the map in real time — from the restaurant all the way to your door. You'll also get updates when your food is being prepared and when it's out for delivery.",
  },
  {
    question: "Is payment safe on ByteBites?",
    answer:
      "Absolutely. You can pay safely using UPI, debit/credit cards, or digital wallets. All payments are secure and your card details are never saved by us.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Most orders arrive within 30–45 minutes depending on your location and the restaurant. You can see the estimated delivery time before you place your order.",
  },
  {
    question: "How can I join as a delivery rider?",
    answer:
      "Sign in with your Google account, choose the Rider option, and set up your profile. You'll get delivery requests on your phone — accept the ones you want, pick up the food, and earn on every delivery.",
  },
  {
    question: "How can my restaurant join ByteBites?",
    answer:
      "Sign in, select the Seller option, and add your restaurant name, menu, and photos. Our team will review your listing. Once approved, you'll start receiving orders directly on your dashboard.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "You can cancel for free before the restaurant starts preparing your food. After that, please contact support through the app and we'll help you as quickly as possible.",
  },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const smoothScrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 72) + 20;
  const target = el.getBoundingClientRect().top + window.scrollY - offset;
  const start = window.scrollY;
  const distance = target - start;
  const duration = 280;
  let startTime: number | null = null;

  const step = (time: number) => {
    if (startTime === null) startTime = time;
    const progress = Math.min((time - startTime) / duration, 1);
    window.scrollTo(0, start + distance * easeOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

const Landing = () => {
  const [promoVisible, setPromoVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateIndicator = useCallback(() => {
    const link = linkRefs.current[activeSection];
    const nav = navRef.current;
    if (!link || !nav) return;
    setIndicator({ left: link.offsetLeft, width: link.offsetWidth });
  }, [activeSection]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    smoothScrollTo(id);
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#080808] text-white">
      {/* Grid + ambient glow */}
      <div className="pointer-events-none fixed inset-0 grid-bg" />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-pulse-glow absolute -top-32 right-0 h-[700px] w-[700px] rounded-full bg-[#E23744]/25 blur-[130px]" />
        <div className="absolute top-1/3 -left-32 h-[500px] w-[500px] rounded-full bg-orange-600/15 blur-[100px]" />
        <div className="absolute bottom-20 right-1/3 h-[400px] w-[400px] rounded-full bg-red-700/10 blur-[90px]" />
      </div>

      {/* Promo banner — shows on load, dismiss until next refresh */}
      {promoVisible && (
        <div className="relative z-50 bg-gradient-to-r from-[#E23744] via-[#ff4757] to-orange-500 px-4 py-2.5 pr-12 text-center sm:pr-14">
          <p className="text-sm font-semibold text-white">
            🎉 &nbsp;First order? Get{" "}
            <span className="underline decoration-white/60 underline-offset-2">
              FREE delivery
            </span>{" "}
            on orders above ₹199 &nbsp;·&nbsp;
            <Link to="/login" className="font-black hover:underline">
              Order now →
            </Link>
          </p>
          <button
            type="button"
            onClick={() => setPromoVisible(false)}
            aria-label="Close offer banner"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white sm:right-4"
          >
            <BiX className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="text-3xl transition group-hover:scale-110">🍔</span>
            <span className="text-2xl font-black tracking-tight">
              Byte<span className="text-[#E23744]">Bites</span>
            </span>
          </Link>
          <nav ref={navRef} className="relative hidden items-center gap-8 text-sm md:flex">
            {navItems.map(({ label, id }) => (
              <button
                key={id}
                type="button"
                ref={(el) => {
                  linkRefs.current[id] = el;
                }}
                onClick={() => scrollToSection(id)}
                className={`relative pb-1 transition-colors duration-300 ${
                  activeSection === id
                    ? "font-semibold text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
            {activeSection && (
              <span
                className="absolute bottom-0 h-0.5 rounded-full bg-[#E23744] transition-all duration-300 ease-out"
                style={{ left: indicator.left, width: indicator.width }}
              />
            )}
          </nav>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-gray-300 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white sm:px-5"
            >
              <BiUser className="h-4 w-4 text-gray-500 transition group-hover:text-white" />
              <span className="sm:hidden">Login</span>
              <span className="hidden sm:inline">Sign in</span>
            </Link>
            <Link
              to="/login"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-[#E23744] to-[#ff4757] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E23744]/35 ring-1 ring-white/10 transition hover:scale-[1.03] hover:shadow-[#E23744]/55 sm:px-6"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
              <span className="relative">Order Now</span>
              <BiRightArrowAlt className="relative h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-20 md:grid-cols-2 md:gap-16 md:pt-24 lg:pt-28">
        <div className="animate-fade-up flex flex-col justify-center md:min-h-[620px] lg:min-h-[680px]">
          <div className="mb-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-base font-medium text-emerald-300">
            <HiOutlineSparkles className="h-5 w-5 text-emerald-400" />
            <span>India&apos;s fastest food delivery platform</span>
            <HiOutlineFire className="h-5 w-5 text-emerald-400" />
          </div>

          <h1 className="text-6xl font-black leading-[1.02] tracking-tight md:text-7xl lg:text-[5.5rem] lg:leading-[1.02] xl:text-[6rem]">
            Crave it.
            <br />
            <span className="text-shimmer">Order it.</span>
            <br />
            <span className="text-white">Love it.</span>
          </h1>

          <p className="mt-8 max-w-xl text-xl leading-relaxed text-gray-400 md:text-[1.35rem] md:leading-relaxed">
            From your favourite local restaurants straight to your door —
            with{" "}
            <span className="font-semibold text-white">live rider tracking</span>
            , instant notifications, and secure payments.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Link
              to="/login"
              className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-[#E23744] px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-[#E23744]/50 transition hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              Get Started Free
              <BiRightArrowAlt className="h-6 w-6 transition group-hover:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="rounded-full border border-white/15 bg-white/5 px-10 py-5 text-lg font-medium text-gray-300 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* iPhone mockup */}
        <div className="flex items-center justify-center md:justify-end md:min-h-[620px] lg:min-h-[680px]">
          <IphoneMockup />
        </div>

        {/* Stats — full width so cards don't clip in half-column */}
        <div className="col-span-full pt-4 md:pt-8">
          <HeroStats />
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
            Cravings?
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            What&apos;s on your mind
          </h2>
          <p className="mt-3 text-gray-500">Tap a category and start ordering</p>
        </div>

        <CategoryCarousel categories={categories} />
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-[#E23744]/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
              Why ByteBites
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Built different.
              <br />
              <span className="bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
                Delivered better.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              Microservices-powered platform — fast delivery, live tracking & secure payments in one app.
            </p>
          </div>

          <FeatureCards features={features} />
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 border-t border-white/5 py-24"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#E23744]/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-orange-600/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
              Simple as 1-2-3
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">How it works</h2>
            <p className="mx-auto mt-4 max-w-md text-gray-500">
              Three easy steps from craving to doorstep — no hassle, no waiting.
            </p>
          </div>

          <HowItWorksSteps steps={steps} />
        </div>
      </section>

      {/* Roles */}
      <section className="relative z-10 border-t border-white/5 py-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-orange-600/10 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-green-600/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
              For everyone
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Join the ByteBites ecosystem
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              Whether you order, sell, or deliver — pick your role and get started in minutes.
            </p>
          </div>

          <RoleCards roles={roles} />
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
            Loved by thousands
          </p>
          <h2 className="mt-3 text-4xl font-black md:text-5xl">What people say</h2>
          <p className="mt-3 text-gray-500">
            Real reviews from customers, riders & restaurant partners
          </p>

          {/* Review stats */}
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {reviewStats.map(({ target, suffix, label, decimals }) => (
              <div
                key={label}
                className="rounded-xl border border-[#E23744]/20 bg-[#E23744]/5 px-4 py-3"
              >
                <p className="text-2xl font-black text-[#ff9a9a]">
                  <AnimatedCounter
                    target={target}
                    suffix={suffix}
                    decimals={decimals ?? 0}
                  />
                </p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 border-t border-white/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#E23744]">
              Got questions?
            </p>
            <h2 className="mt-3 text-4xl font-black md:text-5xl">
              Frequently asked questions
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              Everything you need to know about ordering, tracking, payments & joining ByteBites.
            </p>
          </div>

          <FaqAccordion items={faqItems} />
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E23744] via-[#c9303c] to-orange-600" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
            <div className="relative flex flex-col items-center justify-between gap-8 p-12 text-center md:flex-row md:p-16 md:text-left">
              <div className="flex items-center gap-6">
                <div className="hidden h-20 w-20 items-center justify-center rounded-2xl bg-white/20 sm:flex">
                  <MdDeliveryDining className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white md:text-4xl">
                    Hungry right now?
                  </h3>
                  <p className="mt-2 text-white/80">
                    Sign in with Google and order in under 2 minutes.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="shrink-0 rounded-full bg-white px-10 py-4 text-lg font-black text-[#E23744] shadow-2xl transition hover:scale-105 hover:bg-gray-50"
              >
                Start Ordering →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050505] pt-16 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🍔</span>
                <span className="text-2xl font-black">
                  Byte<span className="text-[#E23744]">Bites</span>
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-500">
                India&apos;s fastest food delivery platform. Order from top
                restaurants with live tracking and secure payments.
              </p>
              <div className="mt-5 flex gap-3">
                {[
                  { Icon: FaInstagram, href: "#", label: "Instagram" },
                  { Icon: FaTwitter, href: "#", label: "Twitter" },
                  { Icon: FaGithub, href: "#", label: "GitHub" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-gray-400 transition hover:border-[#E23744]/50 hover:text-[#E23744]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Company
              </p>
              <ul className="space-y-3">
                {["About Us", "Careers", "Blog", "Press"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Support
              </p>
              <ul className="space-y-3">
                {["Help Centre", "Track Order", "Refund Policy", "Contact Us"].map(
                  (link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 transition hover:text-white">
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Legal + Join */}
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-400">
                Legal
              </p>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                  (link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 transition hover:text-white">
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
              <Link
                to="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E23744] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#c9303c]"
              >
                Join ByteBites →
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
            <p className="text-sm text-gray-600">
              © 2026 ByteBites · All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MdOutlineDeliveryDining className="h-4 w-4 text-[#E23744]" />
              Fast delivery · Live tracking · Secure payments
            </div>
            <p className="text-sm text-gray-600">
              Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default Landing;
