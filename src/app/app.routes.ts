import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards';

/**
 * Configuración de rutas de la aplicación con lazy loading
 *
 * Características:
 * - Lazy loading para optimizar la carga inicial
 * - Guards para proteger rutas (authGuard, guestGuard)
 * - Redirecciones apropiadas
 * - Ruta wildcard para 404
 */
export const routes: Routes = [
  // Redirección raíz a home
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // Home - Página principal
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'Inicio - Shop'
  },

  // Products - Listado de productos
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.component').then(m => m.ProductsComponent),
    title: 'Productos - Shop'
  },

  // Product Detail - Detalle de un producto
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Detalle del Producto - Shop'
  },

  // Checkout - Proceso de compra (requiere autenticación)
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Finalizar Compra - Shop'
  },

  // Order Confirmation - Confirmación de pedido
  {
    path: 'order-confirmation/:orderId',
    loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
    title: 'Confirmación de Pedido - Shop'
  },

  // Blog - Listado de posts
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog - Shop'
  },

  // Blog Detail - Detalle de un post
  {
    path: 'blog/:slug',
    loadComponent: () => import('./pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent),
    title: 'Blog - Shop'
  },

  // About Us - Sobre nosotros
  {
    path: 'about-us',
    loadComponent: () => import('./pages/about-us/about-us.component').then(m => m.AboutUsComponent),
    title: 'Sobre Nosotros - Shop'
  },

  // Contact - Contacto
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto - Shop'
  },

  // Authentication Routes - Solo para usuarios NO autenticados
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - Shop'
  },

  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Registrarse - Shop'
  },

  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
    title: 'Recuperar Contraseña - Shop'
  },

  // Wildcard - Redirige al home si la ruta no existe
  {
    path: '**',
    redirectTo: '/home'
  }
];
