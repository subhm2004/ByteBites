import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { BiCheckCircle, BiLoader } from "react-icons/bi";
import { AppButton, AppCard, AppPage } from "../components/ui/AppUI";
import DownloadReceiptButton from "../components/DownloadReceiptButton";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const sessionId = params.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const { data } = await axios.post(
          `${utilsService}/api/payment/stripe/verify`,
          { sessionId }
        );

        toast.success("Payment successfull 🎉");
        setSuccess(true);
        if (data.orderId) setOrderId(data.orderId);
        if (data.paymentId) setPaymentId(data.paymentId);
      } catch (error) {
        toast.error("Stripe verification faild");
        console.log(error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <AppPage narrow className="flex min-h-[70vh] items-center">
      <AppCard className="mx-auto max-w-md text-center">
        {verifying ? (
          <>
            <BiLoader className="mx-auto mb-4 h-12 w-12 animate-spin text-[#E23744]" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Verifying payment...
            </h1>
          </>
        ) : success ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <BiCheckCircle size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              Payment successful!
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Your Stripe payment was confirmed. Enjoy your meal 🎉
            </p>
            <div className="mt-6 space-y-2">
              {orderId && (
                <DownloadReceiptButton
                  orderId={orderId}
                  paymentId={paymentId || sessionId || undefined}
                  retryUntilPaid
                  variant="primary"
                  label="Download receipt (PDF)"
                />
              )}
              <AppButton onClick={() => navigate("/orders")}>
                View your orders
              </AppButton>
              <AppButton variant="secondary" onClick={() => navigate("/explore")}>
                Back to home
              </AppButton>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-red-600">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">
              Something went wrong. Please contact support if amount was deducted.
            </p>
            <AppButton className="mt-6" onClick={() => navigate("/explore")}>
              Go home
            </AppButton>
          </>
        )}
      </AppCard>
    </AppPage>
  );
};

export default OrderSuccess;
