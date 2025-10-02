// UpdateTransactionModal component
import React, { useState } from "react";
import { XCircle } from "lucide-react"; // or '@heroicons/react/24/outline' if you use Heroicons

import type { OrderWithCustomer } from "../types"; // Adjust the path as needed

type UpdateTransactionModalProps = {
  transaction: OrderWithCustomer;
  onClose: () => void;
  onUpdate: (updates: { status: string; amountPaid: number; paymentMethod: string }) => Promise<void>;
  t: (key: string) => string;
};

const UpdateTransactionModal: React.FC<UpdateTransactionModalProps> = ({ transaction, onClose, onUpdate, t }) => {
  const [status, setStatus] = useState(transaction.status);
  const [amountPaid, setAmountPaid] = useState(transaction.amountPaid);
  const [paymentMethod, setPaymentMethod] = useState(transaction.paymentMethod);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onUpdate({ status, amountPaid, paymentMethod });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t("invoices.actions.update")}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.detail.transaction.id")}
              </label>
              <input
                type="text"
                value={transaction.id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.detail.status")}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="completed">{t("invoices.status.completed")}</option>
                <option value="due">{t("invoices.status.due")}</option>
                <option value="cancelled">{t("invoices.status.cancelled")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.table.total")}
              </label>
              <input
                type="number"
                value={transaction.total}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.table.amountPaid")}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={e => setAmountPaid(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.table.amountDue")}
              </label>
              <input
                type="number"
                value={(Number(transaction.total) - Number(amountPaid)).toFixed(2)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("invoices.detail.payment.method")}
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors mr-2"
                disabled={submitting}
              >
                {t("invoices.detail.close")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled={submitting}
              >
                {submitting ? t("invoices.actions.update") + '...' : t("invoices.actions.update")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTransactionModal;