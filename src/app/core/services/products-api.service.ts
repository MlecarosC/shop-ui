import { Injectable, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WooCommerceApiService } from './woocommerce-api.service';
import { WCProduct, WCCategory } from '../models/woocommerce/wc-product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsApiService extends WooCommerceApiService {
  private productsCache = signal<WCProduct[]>([]);
  private categoriesCache = signal<WCCategory[]>([]);

  getProducts(params?: {
    per_page?: number;
    page?: number;
    category?: string;
    search?: string;
    orderby?: 'date' | 'id' | 'title' | 'price';
    order?: 'asc' | 'desc';
    status?: 'publish' | 'draft' | 'pending';
  }): Observable<WCProduct[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.get<WCProduct[]>('products', httpParams).pipe(
      tap(products => this.productsCache.set(products))
    );
  }

  getProductById(id: number): Observable<WCProduct> {
    return this.get<WCProduct>(`products/${id}`);
  }

  getCategories(params?: {
    per_page?: number;
    page?: number;
    hide_empty?: boolean;
  }): Observable<WCCategory[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.get<WCCategory[]>('products/categories', httpParams).pipe(
      tap(categories => this.categoriesCache.set(categories))
    );
  }

  searchProducts(searchTerm: string, perPage: number = 20): Observable<WCProduct[]> {
    return this.getProducts({ search: searchTerm, per_page: perPage });
  }

  getCachedProducts() {
    return this.productsCache();
  }

  getCachedCategories() {
    return this.categoriesCache();
  }
}
