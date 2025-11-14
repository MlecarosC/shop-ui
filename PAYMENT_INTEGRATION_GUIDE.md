# Guía de Integración de Pagos - Mercado Pago y Transbank

Esta guía te ayudará a configurar los métodos de pago en tu backend de WordPress/WooCommerce para que funcionen con la aplicación Angular.

## 🚀 Inicio Rápido

Para que el sistema de pagos funcione, necesitas seguir estos pasos en orden:

1. **Configurar CORS** (Ver sección "Configurar CORS") - Necesario para peticiones desde Angular
2. **Instalar plugins de pago** (Mercado Pago y/o Transbank)
3. **Agregar endpoints personalizados** (Ver sección "Endpoints Personalizados Necesarios")
4. **Configurar credenciales** en cada plugin de pago
5. **Probar en modo desarrollo** antes de ir a producción

## Requisitos Previos

1. WordPress con WooCommerce instalado
2. Plugin de Mercado Pago para WooCommerce
3. Plugin de Transbank Webpay Plus para WooCommerce

## Plugins Recomendados

### Mercado Pago
- **Plugin:** [WooCommerce Mercado Pago](https://wordpress.org/plugins/woocommerce-mercadopago/)
- **Instalación:** WordPress Admin → Plugins → Añadir nuevo → Buscar "Mercado Pago"

### Transbank
- **Plugin:** [Transbank Webpay Plus](https://wordpress.org/plugins/transbank-webpay-plus-rest/)
- **Instalación:** WordPress Admin → Plugins → Añadir nuevo → Buscar "Transbank Webpay"

## Configuración de WooCommerce

### 1. Habilitar la API REST

En `wp-config.php` o mediante el admin de WordPress, asegúrate de que la API REST esté habilitada.

### 2. Configurar CORS

Añade esto a tu archivo `functions.php` del tema activo:

```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {

        // Orígenes permitidos
        $allowed_origins = [
            'http://localhost:4200',           // Angular dev local
            'https://tu-dominio.com'           // Tu dominio de producción
        ];

        // Obtener el origen de la petición
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        // Verificar si el origen está permitido
        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }

        // Headers necesarios para CORS
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-WP-Nonce');
        header('Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages');
        header('Access-Control-Max-Age: 86400');

        // Manejar peticiones OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }

        return $value;
    });
}, 15);

// CORS adicional para CoCart específicamente
add_filter('cocart_cors_allow_origin', function($allow_origin) {
    return ['http://localhost:4200', 'http://127.0.0.1:4200', 'https://tu-dominio.com'];
});
```

**Alternativa: Configuración en .htaccess**

Si prefieres, también puedes configurar CORS directamente en tu `.htaccess` (agregar después de las reglas de HTTPS):

```apache
# BEGIN CORS Configuration
<IfModule mod_headers.c>
    # Permitir CORS desde localhost Angular
    SetEnvIf Origin "^http://localhost:4200$" AccessControlAllowOrigin=$0
    SetEnvIf Origin "^http://127.0.0.1:4200$" AccessControlAllowOrigin=$0
    SetEnvIf Origin "^https://tu-dominio\.com$" AccessControlAllowOrigin=$0

    Header always set Access-Control-Allow-Origin %{AccessControlAllowOrigin}e env=AccessControlAllowOrigin
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, X-WP-Nonce"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Expose-Headers "X-WP-Total, X-WP-TotalPages"
    Header always set Access-Control-Max-Age "86400"

    # Manejar preflight OPTIONS
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
# END CORS Configuration
```

## Endpoints Personalizados Necesarios

Necesitas crear endpoints personalizados en WordPress para manejar la creación de pagos. Agrega este código a tu tema (en `functions.php`) o crea un plugin personalizado:

### Endpoint para Mercado Pago

```php
<?php
/**
 * Custom endpoint for Mercado Pago payment creation
 */
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/mercadopago/create-preference', array(
        'methods' => 'POST',
        'callback' => 'create_mercadopago_preference',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

function create_mercadopago_preference($request) {
    $order_id = $request->get_param('order_id');

    if (!$order_id) {
        return new WP_Error('missing_order_id', 'Order ID is required', array('status' => 400));
    }

    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('invalid_order', 'Order not found', array('status' => 404));
    }

    // Verify order belongs to current user
    if ($order->get_customer_id() != get_current_user_id()) {
        return new WP_Error('unauthorized', 'Unauthorized access', array('status' => 403));
    }

    // Get Mercado Pago settings
    $mp_settings = get_option('woocommerce_woo-mercado-pago-basic_settings');
    $access_token = $mp_settings['_mp_access_token_prod'];

    // In test mode, use test token
    if ($mp_settings['checkout_mode'] === 'test') {
        $access_token = $mp_settings['_mp_access_token_test'];
    }

    // Prepare preference data
    $preference_data = array(
        'items' => array(),
        'payer' => array(
            'name' => $order->get_billing_first_name(),
            'surname' => $order->get_billing_last_name(),
            'email' => $order->get_billing_email(),
            'phone' => array(
                'number' => $order->get_billing_phone()
            ),
            'address' => array(
                'street_name' => $order->get_billing_address_1(),
                'zip_code' => $order->get_billing_postcode()
            )
        ),
        'back_urls' => array(
            'success' => home_url('/order-received/' . $order_id . '/?key=' . $order->get_order_key()),
            'failure' => home_url('/checkout/?order_id=' . $order_id . '&payment=failed'),
            'pending' => home_url('/order-received/' . $order_id . '/?key=' . $order->get_order_key())
        ),
        'auto_return' => 'approved',
        'external_reference' => (string) $order_id,
        'notification_url' => home_url('/wc-api/WC_WooMercadoPago_Gateway')
    );

    // Add order items
    foreach ($order->get_items() as $item) {
        $preference_data['items'][] = array(
            'title' => $item->get_name(),
            'quantity' => $item->get_quantity(),
            'unit_price' => floatval($item->get_total() / $item->get_quantity()),
            'currency_id' => $order->get_currency()
        );
    }

    // Call Mercado Pago API
    $response = wp_remote_post('https://api.mercadopago.com/checkout/preferences', array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($preference_data),
        'timeout' => 30
    ));

    if (is_wp_error($response)) {
        return new WP_Error('api_error', $response->get_error_message(), array('status' => 500));
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    if (!isset($body['init_point'])) {
        return new WP_Error('preference_error', 'Could not create preference', array('status' => 500));
    }

    // Update order meta
    update_post_meta($order_id, '_mercadopago_preference_id', $body['id']);

    return array(
        'id' => $body['id'],
        'init_point' => $body['init_point'],
        'sandbox_init_point' => $body['sandbox_init_point'] ?? null
    );
}
```

### Endpoint para Transbank

```php
<?php
/**
 * Custom endpoint for Transbank payment creation
 */
add_action('rest_api_init', function () {
    register_rest_route('wc/v3', '/transbank/create-transaction', array(
        'methods' => 'POST',
        'callback' => 'create_transbank_transaction',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
});

function create_transbank_transaction($request) {
    $order_id = $request->get_param('order_id');

    if (!$order_id) {
        return new WP_Error('missing_order_id', 'Order ID is required', array('status' => 400));
    }

    $order = wc_get_order($order_id);

    if (!$order) {
        return new WP_Error('invalid_order', 'Order not found', array('status' => 404));
    }

    // Verify order belongs to current user
    if ($order->get_customer_id() != get_current_user_id()) {
        return new WP_Error('unauthorized', 'Unauthorized access', array('status' => 403));
    }

    // Get Transbank plugin instance
    if (class_exists('WC_Gateway_Transbank_Webpay_Plus_REST')) {
        $gateway = new WC_Gateway_Transbank_Webpay_Plus_REST();

        // Initialize Transbank SDK
        if ($gateway->environment === 'production') {
            \Transbank\Webpay\WebpayPlus::configureForProduction(
                $gateway->commerce_code,
                $gateway->api_key
            );
        } else {
            \Transbank\Webpay\WebpayPlus::configureForTesting();
        }

        try {
            // Create transaction
            $buy_order = 'order_' . $order_id . '_' . time();
            $session_id = session_id() ?: 'session_' . $order_id;
            $amount = intval($order->get_total());
            $return_url = home_url('/wc-api/transbank_webpay_plus_return');

            $response = \Transbank\Webpay\WebpayPlus\Transaction::create(
                $buy_order,
                $session_id,
                $amount,
                $return_url
            );

            // Save transaction token
            update_post_meta($order_id, '_transbank_token', $response->getToken());
            update_post_meta($order_id, '_transbank_buy_order', $buy_order);

            return array(
                'token' => $response->getToken(),
                'url' => $response->getUrl()
            );

        } catch (Exception $e) {
            return new WP_Error('transaction_error', $e->getMessage(), array('status' => 500));
        }
    }

    return new WP_Error('gateway_error', 'Transbank gateway not found', array('status' => 500));
}
```

## Configuración de URLs de Retorno

### Página de Confirmación de Orden

Crea o verifica que existe una página en tu WordPress para mostrar la confirmación de orden después del pago.

### Manejo de Webhooks

Ambos plugins de pago manejan webhooks automáticamente:

- **Mercado Pago:** `/wc-api/WC_WooMercadoPago_Gateway`
- **Transbank:** `/wc-api/transbank_webpay_plus_return`

Asegúrate de que estas URLs estén accesibles y no bloqueadas por firewalls.

## Configuración en Angular

En tu archivo `environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://tu-wordpress.com/wp-json',
  woocommerce: {
    url: 'https://tu-wordpress.com/wp-json/wc/v3',
    consumerKey: 'ck_XXXXXXXXXXXXXXXX',
    consumerSecret: 'cs_XXXXXXXXXXXXXXXX'
  },
  cocart: {
    url: 'https://tu-wordpress.com/wp-json/cocart/v2'
  }
};
```

## Pruebas

### Modo de Prueba - Mercado Pago

1. En el plugin de Mercado Pago, activa el modo de prueba
2. Usa tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing

**Tarjetas de prueba:**
- VISA: 4509 9535 6623 3704
- Mastercard: 5031 7557 3453 0604

### Modo de Prueba - Transbank

1. En el plugin de Transbank, selecciona "Integración"
2. Las credenciales de prueba ya están configuradas

**Tarjetas de prueba:**
- Exitosa: 4051885600446623 (CVV: 123, cualquier fecha futura)
- Rechazada: 5186059559590568

## Troubleshooting

### Error 401/403 al crear orden

- Verifica que el usuario esté autenticado
- Revisa las credenciales de WooCommerce API
- Comprueba los permisos del usuario en WordPress

### Error al redirigir a pasarela de pago

- Verifica que los plugins estén activados
- Revisa las credenciales de producción/prueba
- Comprueba los logs de PHP en WordPress

### Webhooks no funcionan

- Verifica que las URLs de webhook sean accesibles públicamente
- Revisa los logs del plugin de pago
- Comprueba que no haya bloqueadores de firewall

## Seguridad

1. **SIEMPRE usa HTTPS en producción**
2. **NUNCA expongas las credenciales de API en el frontend**
3. **Valida todos los datos en el backend**
4. **Verifica que las órdenes pertenezcan al usuario autenticado**
5. **Usa tokens de seguridad de WordPress (nonces) cuando sea apropiado**

## Recursos Adicionales

- [Documentación Mercado Pago](https://www.mercadopago.com.ar/developers)
- [Documentación Transbank](https://www.transbankdevelopers.cl/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)

---

**Nota Importante:** Los endpoints personalizados mostrados arriba son ejemplos. Debes adaptarlos según la versión específica de los plugins que uses y tus necesidades de negocio.
