import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import toast from "react-hot-toast";
import { BiChevronRight, BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";
import { AppCard, AppPage, PageHeader } from "../components/ui/AppUI";

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
    },
    {
      icon: BiMapPin,
      label: "Saved Addresses",
      desc: "Manage delivery locations",
      onClick: () => navigate("/address"),
    },
  ];

  return (
    <AppPage narrow>
      <PageHeader eyebrow="Account" title="Profile" />

      <AppCard className="mb-4 overflow-hidden !p-0">
        <div className="bg-gradient-to-r from-[#E23744] to-[#ff4757] px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white backdrop-blur-sm">
              {firstLetter}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-white/80">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-gray-50"
              onClick={item.onClick}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E23744]">
                <item.icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <BiChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          ))}

          <button
            type="button"
            className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-red-50"
            onClick={logoutHandler}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
              <BiLogOut className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Log out</p>
              <p className="text-xs text-gray-500">Sign out of your account</p>
            </div>
          </button>
        </div>
      </AppCard>
    </AppPage>
  );
};

export default Account;
