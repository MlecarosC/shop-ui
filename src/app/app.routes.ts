import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';

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
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login')
      .then(m => m.Login)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register')
      .then(m => m.Register)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/forgotPassword/forgotPassword')
      .then(m => m.ForgotPassword)
  },
  { 
    path: '**', 
    redirectTo: '/home' 
  },
];
