import React, { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onPaymentComplete: (
    method: string,
    amountPaid: number,
    amountDue: number,
  ) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  total,
  onClose,
  onPaymentComplete,
}) => {
  const { t } = useLanguage();
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const amountPaid = parseFloat(cashReceived) || total;
    const amountDue = total - amountPaid;
    onPaymentComplete("cash", amountPaid, amountDue);
    setIsProcessing(false);
  };

  // Handle marking as due (partial payment)
  const handleMarkAsDue = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const amountPaid = parseFloat(cashReceived) || 0;
    const amountDue = total - amountPaid;
    onPaymentComplete("cash", amountPaid, amountDue);
    setIsProcessing(false);
  };

  const canPay = parseFloat(cashReceived) >= total;
  const canMarkAsDue = cashReceived === "" || parseFloat(cashReceived) < total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {t("payment.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Total Amount */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("payment.total.amount")}
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${total.toFixed(2)}
            </div>
          </div>

          {/* Cash Payment Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("payment.cash.received")}
              </label>
              <input
                type="number"
                step="0.01"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder={t("payment.enter.amount")}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setCashReceived(total.toFixed(2).toString())}
                className="mt-2 w-full px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
              >
                {t("payment.exact.amount")}
              </button>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-blue-600 dark:text-blue-400 mb-2">
                {t("payment.processing")}
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col space-y-3">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                {t("payment.cancel")}
              </button>
              {parseFloat(cashReceived) < total ? (
                <button
                  onClick={handleMarkAsDue}
                  disabled={!canMarkAsDue || isProcessing}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing
                    ? t("customers.invoice.creating")
                    : t("customers.invoice.create.due")}
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={!canPay || isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isProcessing
                    ? t("payment.processing.button")
                    : t("payment.complete")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
