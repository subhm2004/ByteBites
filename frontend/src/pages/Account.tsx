import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import toast from "react-hot-toast";
import {
  BiChevronRight,
  BiLogOut,
  BiMapPin,
  BiPackage,
  BiShield,
} from "react-icons/bi";
import { AppPage } from "../components/ui/AppUI";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const quickLinks = [
    {
      icon: BiPackage,
      label: "Your Orders",
      desc: "Active & past orders",
      onClick: () => navigate("/orders"),
      card: "from-orange-50/90 to-amber-50/60 dark:from-orange-950/35 dark:to-amber-950/25",
      iconBg:
        "bg-gradient-to-br from-[#E23744] to-[#ff6b7a] text-white shadow-lg shadow-[#E23744]/20",
    },
    {
      icon: BiMapPin,
      label: "Addresses",
      desc: "Saved locations",
      onClick: () => navigate("/address"),
      card: "from-sky-50/90 to-blue-50/60 dark:from-sky-950/35 dark:to-blue-950/25",
      iconBg:
        "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20",
    },
  ];

  return (
    <AppPage narrow>
      <div className="mx-auto max-w-md pb-8">
        {/* Banner + overlapping avatar */}
        <div className="relative mb-14 pt-2">
          <div className="relative h-32 overflow-hidden rounded-3xl bg-gradient-to-br from-[#E23744] via-[#d93240] to-[#a82230] shadow-lg shadow-[#E23744]/15">
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-4 left-10 h-20 w-20 rounded-full bg-orange-300/25 blur-xl" />
          </div>

          <div className="absolute -bottom-11 left-1/2 -translate-x-1/2">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="h-[5.5rem] w-[5.5rem] rounded-2xl border-[3px] border-white object-cover shadow-xl shadow-gray-300/60 ring-4 ring-white/80 dark:border-gray-900 dark:shadow-black/50 dark:ring-gray-900/80"
              />
            ) : (
              <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-2xl border-[3px] border-white bg-gradient-to-br from-[#E23744] to-[#ff6b7a] text-3xl font-black text-white shadow-xl shadow-[#E23744]/25 ring-4 ring-white/80 dark:border-gray-900 dark:ring-gray-900/80">
                {firstLetter}
              </div>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="mt-1 truncate px-4 text-sm text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#E23744]/15 bg-[#E23744]/8 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#E23744] dark:border-[#E23744]/25 dark:bg-[#E23744]/15 dark:text-[#ff6b7a]">
            <BiShield className="h-3 w-3" />
            Customer
          </span>
        </div>

        {/* Quick actions */}
        <p className="mb-3 px-0.5 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Manage account
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              className={`group relative overflow-hidden rounded-2xl border border-gray-100/80 bg-gradient-to-br ${item.card} p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#E23744]/10 hover:shadow-md hover:shadow-gray-200/70 active:scale-[0.98] dark:border-gray-800 dark:hover:border-[#E23744]/20 dark:hover:shadow-black/20`}
            >
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-gray-900 dark:text-white">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
                {item.desc}
              </p>
              <BiChevronRight className="absolute right-3 top-4 h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#E23744] dark:text-gray-600 dark:group-hover:text-[#ff6b7a]" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button
            type="button"
            onClick={logoutHandler}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white py-3.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-red-100/50 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-red-900/40 dark:hover:bg-red-950/25 dark:hover:text-red-400 dark:hover:shadow-none"
          >
            <BiLogOut className="h-[1.15rem] w-[1.15rem] transition group-hover:-translate-x-0.5" />
            Log out
          </button>
        </div>

        <p className="mt-10 text-center text-[11px] text-gray-400 dark:text-gray-600">
          Byte<span className="font-semibold text-[#E23744]">Bites</span> · Delivered
          with love
        </p>
      </div>
    </AppPage>
  );
};

export default Account;
