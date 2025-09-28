export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Exchange rate relative to USD
}

export interface CurrencyContextType {
  currencies: Currency[];
  baseCurrency: Currency;
  displayCurrency: Currency;
  setDisplayCurrency: (currency: Currency) => void;
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  formatAmount: (amount: number, currency?: Currency) => string;
}

export const CURRENCIES: Currency[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1 // Base currency
  },
  {
    code: 'IQD',
    name: 'Iraqi Dinar',
    symbol: 'د.ع',
    rate: 1310 // 1 USD = 1310 IQD (approximate rate)
  }
];