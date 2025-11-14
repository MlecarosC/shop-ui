# Models Directory

This directory contains all TypeScript interfaces and models for the Angular application.

## Structure

```
models/
├── woocommerce/          # WooCommerce API models
│   ├── wc-auth.model.ts        # JWT authentication
│   ├── wc-cart.model.ts        # Cart (CoCart API)
│   ├── wc-category.model.ts    # Product categories
│   ├── wc-common.model.ts      # Shared interfaces
│   ├── wc-order.model.ts       # Orders
│   ├── wc-product.model.ts     # Products & variations
│   ├── wc-user.model.ts        # Customers
│   └── index.ts                # Barrel exports
├── wordpress/            # WordPress API models
│   ├── wp-post.model.ts        # Blog posts
│   ├── wp-user.model.ts        # WordPress users
│   └── index.ts                # Barrel exports
├── blog-post.model.ts    # Simplified blog post for app
├── checkout.model.ts     # Checkout process models
├── contact.model.ts      # Contact Form 7 models
├── password-reset.model.ts # Password recovery
├── payment.model.ts      # Payment gateway models
├── product.model.ts      # Simplified product for app
├── toast.model.ts        # Notification models
└── index.ts              # Main barrel export

```

## Usage

### Importing Models

You can import models in three ways:

1. **From the main barrel** (recommended for application models):
```typescript
import { Product, BlogPost, Toast } from '@core/models';
```

2. **From specific barrels** (for API-specific models):
```typescript
import { WCProduct, WCCart, WCOrder } from '@core/models/woocommerce';
import { WPPost, WPUser } from '@core/models/wordpress';
```

3. **Direct import** (if needed):
```typescript
import { WCProduct } from '@core/models/woocommerce/wc-product.model';
```

### Model Categories

#### WooCommerce Models (`woocommerce/`)
These models represent the WooCommerce REST API and CoCart API responses:

- **wc-common.model.ts**: Shared types (WCImage, WCAddress, WCMetaData, etc.)
- **wc-auth.model.ts**: JWT authentication (login, register, password reset)
- **wc-category.model.ts**: Product categories and tags
- **wc-product.model.ts**: Products, variations, and reviews
- **wc-cart.model.ts**: Shopping cart (CoCart API)
- **wc-order.model.ts**: Orders, line items, and order notes
- **wc-user.model.ts**: Customer accounts

#### WordPress Models (`wordpress/`)
These models represent the WordPress REST API responses:

- **wp-post.model.ts**: Blog posts, categories, tags, media, and comments
- **wp-user.model.ts**: WordPress user accounts

#### Application Models (root)
Simplified models for internal application use:

- **product.model.ts**: Simplified product data structure
- **blog-post.model.ts**: Simplified blog post structure
- **toast.model.ts**: Toast notification system
- **contact.model.ts**: Contact Form 7 integration
- **password-reset.model.ts**: Password recovery flow
- **checkout.model.ts**: Checkout process and order summary
- **payment.model.ts**: Payment gateway integration

## Type Safety

All models use strict TypeScript typing:

- Required fields are marked without `?`
- Optional fields use `?` suffix
- Enums and union types for fixed values
- Proper null handling with `| null`

## Extending Models

When extending or modifying models:

1. Update the corresponding `.model.ts` file
2. Ensure all dependent code is updated
3. Run `npm run build` to check for type errors
4. Update this README if adding new files

## API Mapping

### WooCommerce API → Application Models

The application uses simplified models internally, which are mapped from WooCommerce API responses:

```typescript
// Example: WCProduct → Product
function mapWCProductToProduct(wcProduct: WCProduct): Product {
  return {
    id: wcProduct.id,
    name: wcProduct.name,
    price: parseFloat(wcProduct.price),
    // ... other mappings
  };
}
```

### WordPress API → Application Models

Similarly, WordPress API responses are mapped to simplified models:

```typescript
// Example: WPPost → BlogPost
function mapWPPostToBlogPost(wpPost: WPPost): BlogPost {
  return {
    id: wpPost.id,
    title: wpPost.title.rendered,
    content: wpPost.content.rendered,
    // ... other mappings
  };
}
```

## Best Practices

1. **Use application models** in components and services when possible
2. **Use WooCommerce/WordPress models** only in API service files
3. **Create mapper functions** to convert between API and application models
4. **Keep models immutable** - use readonly properties when appropriate
5. **Document complex types** with JSDoc comments
6. **Avoid any type** - use proper typing or unknown instead

## Related Documentation

- [WooCommerce REST API Documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [CoCart API Documentation](https://docs.cocart.xyz/)
- [WordPress REST API Documentation](https://developer.wordpress.org/rest-api/)
- [Contact Form 7 API](https://contactform7.com/rest-api/)
