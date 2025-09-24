import React from 'react';
import { X, Printer, Mail, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Transaction } from '../types';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // In a real app, this would send the receipt via email
    alert('Receipt sent via email!');
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert('Receipt downloaded as PDF!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('receipt.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Receipt */}
        <div className="p-6 space-y-6" id="receipt">
          {/* Store Header */}
          <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('receipt.store.name')}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('receipt.store.address')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('receipt.store.phone')}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.transaction.id')}</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">{transaction.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.date.time')}</span>
              <span className="text-gray-900 dark:text-gray-100">{transaction.timestamp.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.cashier')}</span>
              <span className="text-gray-900 dark:text-gray-100">{transaction.cashier}</span>
            </div>
            {transaction.client && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t('receipt.client')}</span>
                <span className="text-gray-900 dark:text-gray-100">{transaction.client.name}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">{t('receipt.items.purchased')}</h3>
            </div>
            {transaction.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{item.product.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {item.quantity} × ${item.product.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-right font-medium text-gray-900 dark:text-gray-100">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.subtotal')}</span>
              <span className="text-gray-900 dark:text-gray-100">${transaction.subtotal.toFixed(2)}</span>
            </div>
              {transaction.client && (
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.tax')}</span>
              <span className="text-gray-900 dark:text-gray-100">${transaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2 text-gray-900 dark:text-gray-100">
              <span>{t('receipt.total')}</span>
              <span>${transaction.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.payment.method')}</span>
              <span className="capitalize text-gray-900 dark:text-gray-100">{t(`payment.method.${transaction.paymentMethod}`)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{t('receipt.amount.paid')}</span>
              <span className="text-gray-900 dark:text-gray-100">${transaction.amountPaid.toFixed(2)}</span>
            </div>
            {transaction.change > 0 && (
              <div className="flex justify-between text-sm font-medium text-green-600">
                <span>{t('receipt.change')}</span>
                <span>${transaction.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p>{t('receipt.thank.you')}</p>
            <p>{t('receipt.keep.receipt')}</p>
            {transaction.customer && (
              <p className="mt-2">
                {t('receipt.loyalty.points')} <span className="font-medium text-blue-600">
                  {Math.floor(transaction.total)}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-5 w-5 mb-1" />
              <span className="text-xs">{t('receipt.print')}</span>
            </button>
            <button
              onClick={handleEmail}
              className="flex flex-col items-center justify-center p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Mail className="h-5 w-5 mb-1" />
              <span className="text-xs">{t('receipt.email')}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex flex-col items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="h-5 w-5 mb-1" />
              <span className="text-xs">{t('receipt.download')}</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            {t('receipt.new.transaction')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;