import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/useAppData";
import { BiArrowBack } from "react-icons/bi";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: { code?: string }) => {
    if (!authResult?.code) {
      toast.error("Google sign-in was cancelled or failed");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult.code,
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/explore");
    } catch (error) {
      console.error(error);
      let message = "Problem while login";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 && !error.response.data) {
          message =
            "Auth server blocked — on Mac, turn off AirPlay Receiver (port 5000) or use port 5007";
        } else if (error.response?.data?.message) {
          message = String(error.response.data.message);
        } else if (error.code === "ERR_NETWORK") {
          message = "Cannot reach auth service — is it running on port 5007?";
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => toast.error("Google sign-in was cancelled"),
    flow: "auth-code",
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080808] px-4">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-[#E23744]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[100px]" />

      <Link
        to="/"
        className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
      >
        <BiArrowBack /> Back
      </Link>

      <div className="absolute right-4 top-4">
        <ThemeToggle className="border-white/15 bg-white/10 text-gray-200 hover:bg-white/15 hover:text-white dark:border-white/15 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <span className="text-4xl">🍔</span>
            <h1 className="mt-3 text-3xl font-black text-white">
              Byte<span className="text-[#E23744]">Bites</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Log in or sign up to order food
            </p>
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
          >
            <FcGoogle size={22} />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
            By continuing, you agree to our{" "}
            <span className="text-[#E23744]">Terms of Service</span> &{" "}
            <span className="text-[#E23744]">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
