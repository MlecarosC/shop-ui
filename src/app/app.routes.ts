import { Routes } from '@angular/router';

export const routes: Routes = [
{ 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home')
      .then(m => m.Home)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products')
      .then(m => m.Products)
  },
  { 
    path: 'products/:id', 
    loadComponent: () => import('./pages/productDetail/productDetail')
      .then(m => m.ProductDetail)
  },
  {
    path: 'about-us',
    loadComponent: () => import('./pages/aboutUs/aboutUs')
      .then(m => m.AboutUs)
  },
    { 
    path: 'blog', 
    loadComponent: () => import('./pages/blog/blog')
      .then(m => m.Blog)
  },
  { 
    path: 'blog/:id', 
    loadComponent: () => import('./pages/blogDetail/blogDetail')
      .then(m => m.BlogDetail)
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  },
];
