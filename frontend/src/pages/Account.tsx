import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import toast from "react-hot-toast";
import {
  BiChevronRight,
  BiLogOut,
  BiMapPin,
  BiPackage,
  BiUser,
} from "react-icons/bi";
import { AppPage, PageHeader } from "../components/ui/AppUI";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("logout Success");
  };

  const menuItems = [
    {
      icon: BiPackage,
      label: "Your Orders",
      desc: "Track active & past orders",
      onClick: () => navigate("/orders"),
      accent: "from-orange-500/15 to-amber-500/10 text-[#E23744] dark:from-orange-500/20 dark:to-amber-500/10 dark:text-[#ff6b7a]",
    },
    {
      icon: BiMapPin,
      label: "Saved Addresses",
      desc: "Manage delivery locations",
      onClick: () => navigate("/address"),
      accent: "from-blue-500/15 to-cyan-500/10 text-blue-600 dark:from-blue-500/20 dark:to-cyan-500/10 dark:text-blue-400",
    },
  ];

  return (
    <AppPage narrow>
      <PageHeader eyebrow="Account" title="Profile" />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        {/* Profile header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#E23744] via-[#e23744] to-[#c9303c] px-6 py-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-orange-400/20 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-2xl font-black text-white shadow-lg shadow-black/10 backdrop-blur-md">
              {firstLetter}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white">
                {user?.name}
              </h2>
              <p className="mt-0.5 truncate text-sm text-white/75">
                {user?.email}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                <BiUser className="h-3 w-3" />
                Customer
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="group flex w-full items-center gap-4 bg-white p-5 text-left transition hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/70"
              onClick={item.onClick}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent}`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
              <BiChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#E23744] dark:text-gray-500 dark:group-hover:text-[#ff6b7a]" />
            </button>
          ))}

          <button
            type="button"
            className="group flex w-full items-center gap-4 bg-white p-5 text-left transition hover:bg-red-50 dark:bg-gray-900 dark:hover:bg-red-950/25"
            onClick={logoutHandler}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 dark:from-gray-800 dark:to-gray-800/80 dark:text-gray-300">
              <BiLogOut className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Log out
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Sign out of your account
              </p>
            </div>
            <BiChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400" />
          </button>
        </div>
      </div>
    </AppPage>
  );
};

export default Account;
