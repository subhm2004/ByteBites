import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import { useEffect, useState } from "react";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiUser } from "react-icons/bi";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { isAuth, city, quauntity } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/explore";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/explore" className="group flex shrink-0 items-center gap-2">
          <span className="text-2xl transition group-hover:scale-110">🍔</span>
          <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
            Byte<span className="text-[#E23744]">Bites</span>
          </span>
        </Link>

        {isHomePage && (
          <div className="hidden flex-1 items-center md:flex md:max-w-xl">
            <div className="flex w-full items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-inner transition focus-within:border-[#E23744]/30 focus-within:ring-2 focus-within:ring-[#E23744]/10 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none dark:focus-within:border-[#E23744]/40">
              <div className="flex items-center gap-1.5 border-r border-gray-200 px-3 py-2.5 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                <BiMapPin className="h-4 w-4 shrink-0 text-[#E23744]" />
                <span className="max-w-[100px] truncate text-xs font-medium">
                  {city || "Location"}
                </span>
              </div>
              <div className="flex flex-1 items-center gap-2 px-3">
                <BiSearch className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-[#E23744] transition hover:border-[#E23744]/30 hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#E23744]/40 dark:hover:bg-red-950/40"
          >
            <CgShoppingCart className="h-5 w-5" />
            {quauntity > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E23744] px-1 text-[10px] font-bold text-white">
                {quauntity}
              </span>
            )}
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#E23744]/30 hover:text-[#E23744] dark:border-gray-700 dark:text-gray-200 dark:hover:border-[#E23744]/40 dark:hover:text-[#ff6b7a]"
            >
              <BiUser className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-[#E23744] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c9303c]"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {isHomePage && (
        <div className="border-t border-gray-100 px-4 py-3 md:hidden dark:border-gray-800">
          <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-1 border-r border-gray-200 px-3 py-2.5 dark:border-gray-700">
              <BiMapPin className="h-4 w-4 text-[#E23744]" />
              <span className="max-w-[80px] truncate text-xs text-gray-700 dark:text-gray-300">
                {city}
              </span>
            </div>
            <div className="flex flex-1 items-center gap-2 px-3">
              <BiSearch className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2 text-sm text-gray-900 outline-none dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
