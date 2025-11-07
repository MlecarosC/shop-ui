import { Injectable, signal } from '@angular/core';
import { Product } from '../../pages/products/models/Product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products = signal<Product[]>([
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'Premium noise-cancelling headphones with 30-hour battery life',
      price: 199.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Electronics'
    },
    {
      id: 2,
      name: 'Smart Watch',
      description: 'Feature-rich smartwatch with health tracking capabilities',
      price: 299.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Electronics'
    },
    {
      id: 3,
      name: 'Designer T-Shirt',
      description: 'Premium cotton t-shirt with modern design',
      price: 49.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Clothing'
    },
    {
      id: 4,
      name: 'Running Shoes',
      description: 'Professional running shoes with advanced cushioning',
      price: 129.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Sports'
    },
    {
      id: 5,
      name: 'Programming Guide',
      description: 'Comprehensive guide to modern web development',
      price: 39.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Books'
    },
    {
      id: 6,
      name: 'Coffee Maker',
      description: 'Automatic coffee maker with programmable settings',
      price: 89.99,
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: 'Home'
    }
  ]);

  getAllProducts() {
    return this.products();
  }

  getProductById(id: number) {
    return this.products().find(product => product.id === id) || null;
  }

  getFeaturedProducts(limit: number = 3) {
    return this.products().slice(0, limit);
  }
}
