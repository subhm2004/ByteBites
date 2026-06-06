import { useState } from "react";
import { useAppData } from "../context/useAppData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import { AppButton } from "../components/ui/AppUI";

type Role = "customer" | "rider" | "seller" | null;

const roleConfig = [
  {
    id: "customer" as const,
    label: "Customer",
    desc: "Order food from top restaurants",
    emoji: "🛒",
  },
  {
    id: "rider" as const,
    label: "Delivery Rider",
    desc: "Deliver orders and earn money",
    emoji: "🛵",
  },
  {
    id: "seller" as const,
    label: "Restaurant Partner",
    desc: "Manage menu and receive orders",
    emoji: "🍽️",
  },
];

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/explore", { replace: true });
    } catch (error) {
      alert("something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 via-white to-red-50/30 px-4 py-10 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="w-full max-w-lg animate-fade-up space-y-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#E23744]">
            Welcome
          </p>
          <h1 className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
            How will you use ByteBites?
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pick your role — you can always switch later
          </p>
        </div>

        <div className="space-y-3">
          {roleConfig.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                role === r.id
                  ? "border-[#E23744] bg-red-50/80 shadow-sm shadow-[#E23744]/10 dark:bg-red-950/30"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-2xl dark:bg-gray-800">
                {r.emoji}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{r.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{r.desc}</p>
              </div>
              <div
                className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                  role === r.id
                    ? "border-[#E23744] bg-[#E23744]"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </button>
          ))}
        </div>

        <AppButton disabled={!role} onClick={addRole}>
          Continue
        </AppButton>
      </div>
    </div>
  );
};

export default SelectRole;
