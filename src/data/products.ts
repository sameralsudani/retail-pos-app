import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Coffee Beans',
    price: 24.99,
    category: 'beverages',
    sku: '195026541849',
    stock: 45,
    image: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Rich, aromatic coffee beans sourced from premium farms',
    costPrice: 17.49,
    reorderLevel: 10,
    supplier: 'Global Beverages Inc.'
  },
  {
    id: '2',
    name: 'Organic Green Tea',
    price: 12.99,
    category: 'beverages',
    sku: 'TEA001',
    stock: 32,
    image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Pure organic green tea leaves with natural antioxidants',
    costPrice: 9.09,
    reorderLevel: 8,
    supplier: 'Global Beverages Inc.'
  },
  {
    id: '3',
    name: 'Artisan Bread',
    price: 6.50,
    category: 'bakery',
    sku: 'BRD001',
    stock: 18,
    image: 'https://images.pexels.com/photos/209196/pexels-photo-209196.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Freshly baked artisan bread with crispy crust'
  },
  {
    id: '4',
    name: 'Fresh Croissants',
    price: 3.75,
    category: 'bakery',
    sku: 'CRS001',
    stock: 24,
    image: 'https://images.pexels.com/photos/2638026/pexels-photo-2638026.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Buttery, flaky croissants baked fresh daily'
  },
  {
    id: '5',
    name: 'Apple iPhone Case',
    price: 29.99,
    category: 'electronics',
    sku: 'ACC001',
    stock: 67,
    image: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Protective case for iPhone with premium materials'
  },
  {
    id: '6',
    name: 'Wireless Headphones',
    price: 89.99,
    category: 'electronics',
    sku: 'HDP001',
    stock: 23,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'High-quality wireless headphones with noise cancellation'
  },
  {
    id: '7',
    name: 'Organic Apples',
    price: 4.99,
    category: 'produce',
    sku: 'FRT001',
    stock: 156,
    image: 'https://images.pexels.com/photos/209439/pexels-photo-209439.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Fresh organic apples, crisp and sweet'
  },
  {
    id: '8',
    name: 'Fresh Bananas',
    price: 2.99,
    category: 'produce',
    sku: 'FRT002',
    stock: 89,
    image: 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Ripe yellow bananas, perfect for snacking'
  },
  {
    id: '9',
    name: 'Notebook Set',
    price: 15.99,
    category: 'stationery',
    sku: 'STN001',
    stock: 42,
    image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'High-quality notebook set for writing and sketching'
  },
  {
    id: '10',
    name: 'Premium Pens',
    price: 8.99,
    category: 'stationery',
    sku: 'PEN001',
    stock: 78,
    image: 'https://images.pexels.com/photos/159832/justice-law-case-hearing-159832.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Smooth-writing premium ballpoint pens'
  },
  {
    id: '11',
    name: 'Designer T-Shirt',
    price: 34.99,
    category: 'clothing',
    sku: 'CLT001',
    stock: 28,
    image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Comfortable cotton t-shirt with modern design'
  },
  {
    id: '12',
    name: 'Denim Jeans',
    price: 79.99,
    category: 'clothing',
    sku: 'CLT002',
    stock: 19,
    image: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300',
    description: 'Classic fit denim jeans in premium quality'
  }
];