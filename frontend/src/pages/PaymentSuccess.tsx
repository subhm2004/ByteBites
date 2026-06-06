import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/useAppData";
import { useEffect } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import { AppButton, AppCard, AppPage } from "../components/ui/AppUI";
import DownloadReceiptButton from "../components/DownloadReceiptButton";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppPage narrow className="flex min-h-[70vh] items-center">
      <AppCard className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <BiCheckCircle size={48} className="text-emerald-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Payment successful!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your order has been placed. Sit back — hot food is on the way 🎉
        </p>

        {paymentId && (
          <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-left dark:bg-gray-800/60">
            <p className="text-xs font-medium text-gray-400">Payment ID</p>
            <p className="mt-0.5 break-all font-mono text-xs text-gray-600 dark:text-gray-300">
              {paymentId}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {orderId && (
            <DownloadReceiptButton
              orderId={orderId}
              paymentId={paymentId}
              retryUntilPaid
              variant="primary"
              label="Download receipt (PDF)"
            />
          )}
          <AppButton onClick={() => navigate("/orders")}>
            Track your order <BsArrowRight size={16} />
          </AppButton>
          <AppButton variant="secondary" onClick={() => navigate("/explore")}>
            Order more food
          </AppButton>
        </div>
      </AppCard>
    </AppPage>
  );
};

export default PaymentSuccess;
