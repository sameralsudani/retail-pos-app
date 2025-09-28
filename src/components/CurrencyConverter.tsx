import React, { useState } from 'react';
import { ArrowRightLeft, Calculator } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencyConverter: React.FC = () => {
  const { currencies, convertAmount, exchangeRate } = useCurrency();
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState(currencies[0]);
  const [toCurrency, setToCurrency] = useState(currencies[1]);

  const convertedAmount = convertAmount(parseFloat(amount) || 0, fromCurrency, toCurrency);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrentRate = () => {
    if (fromCurrency.code === 'USD' && toCurrency.code === 'IQD') {
      return exchangeRate;
    } else if (fromCurrency.code === 'IQD' && toCurrency.code === 'USD') {
      return 1 / exchangeRate;
    }
    return 1;
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
        <div className="ml-auto text-xs text-gray-500">
          Rate: 1 USD = {exchangeRate.toLocaleString()} IQD
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <select
              value={fromCurrency.code}
              onChange={(e) => {
                const currency = currencies.find(c => c.code === e.target.value);
                if (currency) setFromCurrency(currency);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="flex">
              <select
                value={toCurrency.code}
                onChange={(e) => {
                  const currency = currencies.find(c => c.code === e.target.value);
                  if (currency) setToCurrency(currency);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name}
                  </option>
                ))}
              </select>
              <button
                onClick={swapCurrencies}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Converted Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              {toCurrency.symbol} {convertedAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              1 {fromCurrency.code} = {getCurrentRate().toLocaleString()} {toCurrency.code}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;