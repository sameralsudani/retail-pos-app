import React from 'react';
import { Minus, Plus, X, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">{t('cart.empty.title')}</h3>
          <p className="text-sm sm:text-base text-gray-500">{t('cart.empty.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Cart Header */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('cart.items.in.cart')}</span>
        <button
          onClick={onClearCart}
          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          title="Clear cart"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
          {items.map((item) => (
            <div key={item.product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h4
                        className={
                          `text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex items-center` +
                          (document?.documentElement?.dir === 'rtl' ? ' ml-2' : ' mr-2')
                        }
                      >
                        {/* If you have an icon, place it here, otherwise remove this comment */}
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.product.sku}</p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="ml-1 sm:ml-2 text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      
                      <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-center text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.product.price.toFixed(2)} {t('product.each')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cart;