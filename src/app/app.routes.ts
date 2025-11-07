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
    path: '**', 
    redirectTo: '/home' 
  }
];
