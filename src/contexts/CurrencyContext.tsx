import React, { createContext, useContext, useState, ReactNode } from "react";
import { Currency, CurrencyContextType, CURRENCIES } from "../types/currency";

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({
  children,
}) => {
  const [baseCurrency] = useState<Currency>(CURRENCIES[0]); // USD as base
  // Load currency from localStorage if available
  const getInitialCurrency = () => {
    const savedCode =
      typeof window !== "undefined"
        ? localStorage.getItem("currencyCode")
        : null;
    const found = CURRENCIES.find((c) => c.code === savedCode);
    return found || CURRENCIES[0];
  };
  const [displayCurrency, setDisplayCurrencyState] = useState<Currency>(
    getInitialCurrency()
  );
  const [exchangeRate, setExchangeRate] = useState<number>(1310); // IQD to USD rate
  // Override IQD rate in currencies array when exchangeRate changes
  const currencies = React.useMemo(() => {
    return CURRENCIES.map((c) =>
      c.code === "IQD" ? { ...c, rate: exchangeRate } : c
    );
  }, [exchangeRate]);
  // Persist currency to localStorage
  const setDisplayCurrency = (currency: Currency) => {
    setDisplayCurrencyState(currency);
    if (typeof window !== "undefined") {
      localStorage.setItem("currencyCode", currency.code);
    }
  };

  const convertAmount = (
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number => {
    if (fromCurrency.code === toCurrency.code) return amount;

    // Use dynamic exchange rate for IQD
    const fromRate =
      fromCurrency.code === "IQD" ? exchangeRate : fromCurrency.rate;
    const toRate = toCurrency.code === "IQD" ? exchangeRate : toCurrency.rate;

    // Convert to USD first if not already
    const usdAmount = fromCurrency.code === "USD" ? amount : amount / fromRate;

    // Convert from USD to target currency
    const convertedAmount =
      toCurrency.code === "USD" ? usdAmount : usdAmount * toRate;

    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  };

  const formatAmount = (amount: number, currency?: Currency): string => {
    const curr = currency || displayCurrency;
    const convertedAmount = convertAmount(amount, baseCurrency, curr);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: curr.code,
      currencyDisplay: "symbol",
    }).format(convertedAmount);
  };

  const value: CurrencyContextType = {
    currencies,
    baseCurrency,
    displayCurrency,
    setDisplayCurrency,
    exchangeRate,
    setExchangeRate,
    convertAmount,
    formatAmount,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
