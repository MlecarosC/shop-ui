import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductsApiService } from '../../core/services/products-api.service';
import { Product } from '../../pages/products/models/Product';
import { WCProduct } from '../../core/models/woocommerce/wc-product.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsApiService = inject(ProductsApiService);

  private stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  private mapWCProductToProduct(wcProduct: WCProduct): Product {
    const shortDescription = wcProduct.short_description || wcProduct.description;
    const cleanDescription = this.stripHtml(shortDescription).trim();

    return {
      id: wcProduct.id,
      name: wcProduct.name,
      description: cleanDescription,
      fullDescription: wcProduct.description,
      price: parseFloat(wcProduct.price),
      image: wcProduct.images[0]?.src || 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      category: wcProduct.categories[0]?.name || 'General'
    };
  }

  getAllProducts() {
    return toSignal(
      this.productsApiService.getProducts({ per_page: 100 }).pipe(
        map(wcProducts => wcProducts.map(wp => this.mapWCProductToProduct(wp)))
      ),
      { initialValue: [] }
    );
  }

  getProductById(id: number) {
    return toSignal(
      this.productsApiService.getProductById(id).pipe(
        map(wcProduct => this.mapWCProductToProduct(wcProduct))
      ),
      { initialValue: null }
    );
  }

  getFeaturedProducts(limit: number = 2) {
    return toSignal(
      this.productsApiService.getProducts({ per_page: limit, orderby: 'date' }).pipe(
        map(wcProducts => wcProducts.map(wp => this.mapWCProductToProduct(wp)))
      ),
      { initialValue: [] }
    );
  }
}
