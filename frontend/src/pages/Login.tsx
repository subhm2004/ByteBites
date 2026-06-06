import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/useAppData";

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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-3xl font-bold text-[#E23774]">
          ByteBites
        </h1>

        <p className="text-center text-sm text-gray-500">
          Log in or sign up to continue
        </p>

        <button
          onClick={googleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3"
        >
          <FcGoogle size={20} />
          {loading ? "Signing in ..." : "Continue with Google"}
        </button>

        <p className="text-center text-xs text-gray-400">
          By continuing, you agree with our{" "}
          <span className="text-[#E23774]">Terms of Service</span> &{" "}
          <span className="text-[#E23774]">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
