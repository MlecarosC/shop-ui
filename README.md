# Shop UI - Frontend Angular para WooCommerce

Frontend moderno en Angular 20 para tu tienda WooCommerce con integración completa de productos, carrito, checkout y pagos.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración de WordPress](#configuración-de-wordpress)
- [Configuración del Frontend](#configuración-del-frontend)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Desarrollo](#desarrollo)
- [Producción](#producción)
- [Seguridad](#seguridad)
- [Integraciones de Pago](#integraciones-de-pago)
- [Solución de Problemas](#solución-de-problemas)

---

## ✨ Características

✅ **Autenticación Completa**
- Login, Registro y Recuperación de Contraseña
- JWT Authentication
- Guards para protección de rutas
- Sesión persistente con localStorage

✅ **Catálogo de Productos**
- Listado con filtros y paginación
- Detalle de producto con descripción HTML
- Búsqueda de productos
- Categorías dinámicas

✅ **Carrito de Compras**
- Integración con CoCart API
- Carrito anónimo con cart_key
- Actualización en tiempo real
- Persistencia entre sesiones

✅ **Proceso de Checkout**
- Formulario completo de facturación y envío
- Métodos de pago: Mercado Pago, Transbank, FACTO
- Validaciones exhaustivas
- Confirmación de pedido

✅ **Blog**
- Listado de posts con paginación
- Detalle con contenido HTML sanitizado
- Categorías y tags
- Posts destacados

✅ **Páginas Institucionales**
- Sobre Nosotros
- Contacto con Contact Form 7
- Página de inicio con secciones dinámicas

✅ **Seguridad**
- Mensajes de error seguros
- Sanitización de HTML
- Interceptors para manejo de errores JWT
- No expone consumer_key en el frontend

✅ **UX/UI**
- Diseño responsive con Tailwind CSS
- DaisyUI components
- Loading states con skeletons
- Notificaciones toast
- Transiciones suaves

---

## 🛠️ Tecnologías

- **Angular**: 20.3.0
- **TypeScript**: 5.9.2
- **Tailwind CSS**: 4.1.17
- **DaisyUI**: 5.5.3
- **RxJS**: 7.8.0

---

## 📦 Requisitos

### Frontend
- Node.js >= 18.x
- npm >= 9.x
- Angular CLI >= 20.x

### Backend (WordPress)
- WordPress >= 6.0
- PHP >= 7.4
- WooCommerce >= 4.0
- MySQL >= 5.7

---

## 🚀 Instalación

### 1. Clonar el Repositorio

\`\`\`bash
git clone <tu-repositorio>
cd shop-ui
\`\`\`

### 2. Instalar Dependencias

\`\`\`bash
npm install
\`\`\`

### 3. Configurar Variables de Entorno

Edita \`src/environments/environment.ts\`:

\`\`\`typescript
export const environment = {
  production: false,
  apiUrl: 'https://reblives.com/wp-json',
  // ... configuración
};
\`\`\`

---

## ⚙️ Configuración de WordPress

### Plugins Necesarios

1. **WooCommerce** (>= 4.0)
2. **JWT Authentication for WP REST API**
3. **CoCart** (>= 2.0)
4. **Contact Form 7**
5. **Better DWP Reset Password**
6. **Mercado Pago Official** (para pagos)
7. **Transbank Webpay Plus** (para pagos Chile)

### Configurar JWT en wp-config.php

\`\`\`php
define('JWT_AUTH_SECRET_KEY', 'tu-clave-secreta-aqui');
define('JWT_AUTH_CORS_ENABLE', true);
\`\`\`

### Instalar Endpoints Personalizados

Copia \`wordpress-custom-endpoints.php\` en functions.php de tu tema.

---

## 💻 Desarrollo

\`\`\`bash
npm start
\`\`\`

Aplicación en \`http://localhost:4200/\`

---

## 🚢 Producción

\`\`\`bash
npm run build -- --configuration=production
\`\`\`

---

## 🔒 Seguridad

⚠️ **NUNCA expongas consumer_key en el frontend**

Este proyecto usa endpoints personalizados seguros para crear órdenes.

---

## 💳 Integraciones de Pago

- **Mercado Pago**: Plugin oficial configurado
- **Transbank**: Plugin oficial para Chile
- **FACTO**: Facturación electrónica

---

## 📚 Documentación

Ver documentación completa en este README.

---

¡Listo para usar! 🚀
