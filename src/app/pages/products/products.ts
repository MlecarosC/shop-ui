import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { ProductCard } from '../../shared/components/productCard/productCard';
import { Product } from './models/Product';

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  readonly categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];

  selectedCategories = signal<Set<string>>(new Set());

  allProducts = signal<Product[]>([
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

  filteredProducts = computed(() => {
    const selected = this.selectedCategories();
    const products = this.allProducts();
    
    if (selected.size === 0) {
      return products;
    }
    
    return products.filter(product => selected.has(product.category));
  });

  toggleCategory(category: string): void {
    const current = new Set(this.selectedCategories());
    
    if (current.has(category)) {
      current.delete(category);
    } else {
      current.add(category);
    }
    
    this.selectedCategories.set(current);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  resetFilters(): void {
    this.selectedCategories.set(new Set());
  }
}
