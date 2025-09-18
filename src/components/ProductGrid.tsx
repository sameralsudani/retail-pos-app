import React from 'react';
import { Plus, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart }) => {
  const { t } = useLanguage();

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 group"
          >
            <div className="relative aspect-square bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {product.stock <= 10 && (
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {t('cart.low.stock')}
                </div>
              )}
              <button
                onClick={() => onAddToCart(product)}
                className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 bg-blue-600 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg opacity-0 group-hover:opacity-100"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
            
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>{product.sku}</span>
                <div className="flex items-center space-x-1">
                  <Package className="h-3 w-3" />
                  <span>{product.stock}</span>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 leading-tight">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <span className="text-sm sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
    )
    }
    </div>
  );
};

export default ProductGrid;