import { useEffect, useState } from "react";

const restaurants = [
  {
    name: "Spice Garden",
    cuisine: "North Indian",
    time: "25 min",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
  {
    name: "Burger Hub",
    cuisine: "American",
    time: "18 min",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=80",
  },
  {
    name: "Pizza Palace",
    cuisine: "Italian",
    time: "30 min",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
  },
  {
    name: "Biryani Blues",
    cuisine: "Hyderabadi",
    time: "28 min",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80",
  },
  {
    name: "Sushi Express",
    cuisine: "Japanese",
    time: "35 min",
    rating: "4.6",
    img: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&q=80",
  },
  {
    name: "Taco Fiesta",
    cuisine: "Mexican",
    time: "22 min",
    rating: "4.5",
    img: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80",
  },
  {
    name: "Chaat Corner",
    cuisine: "Street Food",
    time: "15 min",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1599307767316-776533bb941c?w=400&q=80",
  },
  {
    name: "Momos Mania",
    cuisine: "Chinese",
    time: "20 min",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1664990035720-faac522df41f?w=400&q=80",
  },
  {
    name: "Daal Depot",
    cuisine: "Punjabi",
    time: "26 min",
    rating: "4.6",
    img: "https://images.unsplash.com/photo-1606471191009-63994c53433b?w=400&q=80",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const formatSystemTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const trackingMessages = [
  "Rahul arriving in 2 min",
  "Rahul is 500m away",
  "Almost at your door!",
];

const categoryChips = ["🍕 Pizza", "🍛 Biryani", "🍔 Burger", "🍣 Sushi", "☕ Coffee"];

const IphoneMockup = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [trackingMsg, setTrackingMsg] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [systemTime, setSystemTime] = useState(formatSystemTime);
  const [greeting, setGreeting] = useState(getGreeting);

  const featured = restaurants[activeIndex];
  const upNext = [
    restaurants[(activeIndex + 1) % restaurants.length],
    restaurants[(activeIndex + 2) % restaurants.length],
    restaurants[(activeIndex + 3) % restaurants.length],
  ];

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setSystemTime(formatSystemTime());
      setGreeting(getGreeting());
    };
    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const cardTimer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % restaurants.length);
      setCardKey((k) => k + 1);
    }, 3800);
    const trackTimer = setInterval(
      () => setTrackingMsg((i) => (i + 1) % trackingMessages.length),
      3200
    );
    return () => {
      clearInterval(cardTimer);
      clearInterval(trackTimer);
    };
  }, []);

  return (
    <div className="iphone-scene animate-float-slow">
      <div className="iphone-glow" />
      <div className="iphone-glow iphone-glow-secondary" />

      <div className="iphone-tilt">
          <div className="iphone-frame">
          <div className="iphone-frame-shine" />
          {/* iPhone 16 Pro Max — Action + Volume | Power + Camera Control */}
          <div className="iphone-btn iphone-btn-action" />
          <div className="iphone-btn iphone-btn-vol-up" />
          <div className="iphone-btn iphone-btn-vol-down" />
          <div className="iphone-btn iphone-btn-power" />
          <div className="iphone-btn iphone-btn-camera" />

          <div className="iphone-screen">
            <div className="iphone-screen-glare" />
            <div className="iphone-screen-vignette" />

            <div className="iphone-island">
              <div className="iphone-island-sensor" />
              <div className="iphone-island-cam" />
            </div>

            <div className="iphone-status">
              <span className="iphone-time">{systemTime}</span>
              <div className="iphone-status-icons">
                <svg width="17" height="12" viewBox="0 0 17 12" fill="white">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" opacity="0.4" />
                  <rect x="4.5" y="5" width="3" height="7" rx="0.5" opacity="0.6" />
                  <rect x="9" y="2" width="3" height="10" rx="0.5" opacity="0.8" />
                  <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="white">
                  <path
                    d="M8 2.4C10.4 2.4 12.5 3.4 14 5L15.2 3.6C13.4 1.6 10.8 0.4 8 0.4C5.2 0.4 2.6 1.6 0.8 3.6L2 5C3.5 3.4 5.6 2.4 8 2.4Z"
                    opacity="0.5"
                  />
                  <path
                    d="M8 5.6C9.6 5.6 11 6.2 12 7.2L13.2 5.8C11.8 4.4 10 3.6 8 3.6C6 3.6 4.2 4.4 2.8 5.8L4 7.2C5 6.2 6.4 5.6 8 5.6Z"
                    opacity="0.75"
                  />
                  <circle cx="8" cy="10" r="1.8" />
                </svg>
                <div className="iphone-battery">
                  <div className="iphone-battery-fill" />
                </div>
              </div>
            </div>

            <div className="iphone-app">
              <div
                className={`iphone-app-header ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.1s" }}
              >
                <div>
                  <p className="iphone-app-greeting">{greeting} 👋</p>
                  <p className="iphone-app-brand">
                    <span className="iphone-brand-emoji">🍔</span> ByteBites
                  </p>
                </div>
                <div className="iphone-avatar">S</div>
              </div>

              <div
                className={`iphone-location ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.2s" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#E23744">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <div>
                  <p className="iphone-loc-label">Delivering to</p>
                  <p className="iphone-loc-addr">Connaught Place, Delhi</p>
                </div>
              </div>

              <div
                className={`iphone-search ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.3s" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span className="iphone-search-text">
                  Search restaurants, cuisines...
                  <span className="iphone-search-cursor" />
                </span>
              </div>

              <div
                className={`iphone-categories ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.32s" }}
              >
                {categoryChips.map((chip) => (
                  <span key={chip} className="iphone-category-chip">
                    {chip}
                  </span>
                ))}
              </div>

              <div
                className={`iphone-promo ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.34s" }}
              >
                <span className="iphone-promo-icon">🎉</span>
                <span className="iphone-promo-text">
                  First order? <strong>50% off</strong> with BYTEBITES50
                </span>
              </div>

              <p
                className={`iphone-section-label ${mounted ? "iphone-app-in" : ""}`}
                style={{ animationDelay: "0.35s" }}
              >
                Restaurants near you
              </p>

              <div className="iphone-cards-viewport">
                <div key={cardKey} className="iphone-featured-card">
                  <div className="iphone-featured-img">
                    <img src={featured.img} alt={featured.name} />
                    <div className="iphone-featured-img-shade" />
                    <span className="iphone-featured-rating">
                      ★ {featured.rating}
                    </span>
                    <span className="iphone-featured-badge">Free delivery</span>
                  </div>
                  <div className="iphone-featured-body">
                    <div className="iphone-featured-text">
                      <p className="iphone-featured-name">{featured.name}</p>
                      <p className="iphone-featured-meta">
                        {featured.cuisine} · {featured.time}
                      </p>
                    </div>
                    <button type="button" className="iphone-featured-btn">
                      Order
                    </button>
                  </div>
                </div>

                <div className="iphone-mini-list">
                  {upNext.map((r) => (
                    <div key={r.name} className="iphone-mini-row">
                      <img src={r.img} alt={r.name} className="iphone-mini-thumb" />
                      <div className="iphone-mini-info">
                        <p className="iphone-mini-name">{r.name}</p>
                        <p className="iphone-mini-meta">
                          {r.cuisine} · {r.time}
                        </p>
                      </div>
                      <span className="iphone-mini-rating">★ {r.rating}</span>
                    </div>
                  ))}
                </div>

                <div className="iphone-dots" aria-hidden>
                  {restaurants.map((_, i) => (
                    <span
                      key={i}
                      className={`iphone-dot ${i === activeIndex ? "iphone-dot-active" : ""}`}
                    />
                  ))}
                </div>
              </div>

              <div
                className={`iphone-tracking ${mounted ? "iphone-tracking-in" : ""}`}
              >
                <div className="iphone-tracking-dot">
                  <span className="iphone-tracking-ping" />
                  <span className="iphone-tracking-core" />
                </div>
                <div className="iphone-tracking-text">
                  <p className="iphone-tracking-title">Live order tracking</p>
                  <p
                    key={trackingMsg}
                    className="iphone-tracking-sub iphone-tracking-sub-animate"
                  >
                    {trackingMessages[trackingMsg]}
                  </p>
                </div>
                <div className="iphone-mini-map">
                  <div className="iphone-mini-map-route" />
                  <div className="iphone-mini-map-dot iphone-mini-map-rider" />
                  <div className="iphone-mini-map-dot iphone-mini-map-home" />
                </div>
              </div>
            </div>

            <div className="iphone-home-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IphoneMockup;
