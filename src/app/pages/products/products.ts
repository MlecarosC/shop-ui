import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { ProductCard } from '../../shared/components/productCard/productCard';
import { ProductService } from '../../shared/services/product.service';

@Component({
  selector: 'app-products',
  imports: [ProductCard],
  templateUrl: './products.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  private productService = inject(ProductService);
  
  readonly categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Toys'];
  selectedCategories = signal<Set<string>>(new Set());
  allProducts = this.productService.getAllProducts();

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
