import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ProductCard } from '../../shared/components/productCard/productCard';
import { ProductService } from '../../shared/services/product.service';
import { ProductsApiService } from '../../core/services/products-api.service';
import { Loading } from '../../shared/components/loading/loading';

@Component({
  selector: 'app-products',
  imports: [ProductCard, Loading],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private productService = inject(ProductService);
  private productsApiService = inject(ProductsApiService);
  
  categories = signal<string[]>([]);
  selectedCategories = signal<Set<string>>(new Set());
  allProducts = this.productService.getAllProducts();
  isLoading = signal(true);

  constructor() {
    this.productsApiService.getCategories({ per_page: 100 }).subscribe({
      next: (cats) => {
        const categoryNames = cats
          .map(cat => cat.name)
          .filter(name => name.toLowerCase() !== 'uncategorized')
          .sort();
        this.categories.set(categoryNames);
        
        setTimeout(() => {
          this.isLoading.set(false);
        }, 500);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categories.set([]);
        this.isLoading.set(false);
      }
    });
  }

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
