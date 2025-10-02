import React from 'react';
import { Globe } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySelector: React.FC = () => {
  const { currencies, displayCurrency, setDisplayCurrency } = useCurrency();

  // Cycle to next currency in the list
  const switchCurrency = () => {
    if (!currencies || currencies.length === 0) return;
    const currentIdx = currencies.findIndex(c => c.code === displayCurrency.code);
    const nextIdx = (currentIdx + 1) % currencies.length;
    setDisplayCurrency(currencies[nextIdx]);
  };

  return (
    <button
      onClick={switchCurrency}
      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title={`Switch currency (${displayCurrency.code})`}
    >
      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline font-medium text-sm">
        <span className={`${document.documentElement.dir === 'rtl' ? 'mr-2' : 'ml-2'}`}>
          {displayCurrency.symbol} {displayCurrency.code}
        </span>
      </span>
    </button>
  );
};

export default CurrencySelector;