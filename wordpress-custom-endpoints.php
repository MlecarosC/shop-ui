<?php
/**
 * WordPress Custom Endpoints para Shop-UI Angular
 *
 * Este archivo contiene endpoints REST personalizados que manejan operaciones
 * sensibles que requieren consumer_key de WooCommerce de forma segura.
 *
 * INSTALACIÓN:
 * 1. Copia este código en tu tema (functions.php) o en un plugin personalizado
 * 2. Activa el código
 * 3. Configura las constantes de WooCommerce si no existen
 *
 * IMPORTANTE: Este código maneja las claves de WooCommerce de forma segura en el servidor
 *
 * @package ShopUI
 * @version 1.0.0
 */

// Evitar acceso directo
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registrar endpoints REST personalizados
 */
add_action('rest_api_init', function () {
    // Endpoint para crear órdenes de forma segura
    register_rest_route('custom/v1', '/orders/create', array(
        'methods' => 'POST',
        'callback' => 'shop_create_order_secure',
        'permission_callback' => 'shop_check_jwt_auth'
    ));

    // Endpoint para obtener órdenes del usuario
    register_rest_route('custom/v1', '/orders/my-orders', array(
        'methods' => 'GET',
        'callback' => 'shop_get_user_orders_secure',
        'permission_callback' => 'shop_check_jwt_auth'
    ));

    // Endpoint para verificar si un usuario compró un producto
    register_rest_route('custom/v1', '/orders/has-purchased/(?P<product_id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'shop_check_user_purchased_product',
        'permission_callback' => 'shop_check_jwt_auth'
    ));
});

/**
 * Verificar autenticación JWT
 *
 * @param WP_REST_Request $request
 * @return bool|WP_Error
 */
function shop_check_jwt_auth($request) {
    // Obtener el header de autorización
    $auth_header = $request->get_header('Authorization');

    if (!$auth_header) {
        return new WP_Error(
            'no_auth_header',
            'No se proporcionó el header de autorización',
            array('status' => 401)
        );
    }

    // Extraer el token
    $token = str_replace('Bearer ', '', $auth_header);

    if (!$token) {
        return new WP_Error(
            'no_token',
            'No se proporcionó el token de autenticación',
            array('status' => 401)
        );
    }

    // Validar el token con el plugin JWT Auth
    $validation = apply_filters('jwt_auth_token_before_dispatch', $token, $request);

    if (is_wp_error($validation)) {
        return $validation;
    }

    return true;
}

/**
 * Obtener el usuario actual desde el JWT token
 *
 * @param WP_REST_Request $request
 * @return int|false User ID o false si falla
 */
function shop_get_current_user_from_jwt($request) {
    $auth_header = $request->get_header('Authorization');
    $token = str_replace('Bearer ', '', $auth_header);

    if (!$token) {
        return false;
    }

    try {
        // Decodificar el token JWT
        $secret_key = defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : false;

        if (!$secret_key) {
            return false;
        }

        // Usar la librería JWT del plugin
        if (!class_exists('Firebase\JWT\JWT')) {
            return false;
        }

        $decoded = \Firebase\JWT\JWT::decode($token, $secret_key, array('HS256'));

        if (isset($decoded->data->user->id)) {
            return $decoded->data->user->id;
        }
    } catch (Exception $e) {
        return false;
    }

    return false;
}

/**
 * Crear orden de forma segura
 *
 * Este endpoint recibe los datos de la orden desde Angular y crea la orden
 * usando las consumer_key almacenadas de forma segura en el servidor.
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function shop_create_order_secure($request) {
    // Obtener el usuario actual
    $user_id = shop_get_current_user_from_jwt($request);

    if (!$user_id) {
        return new WP_Error(
            'invalid_user',
            'No se pudo identificar al usuario',
            array('status' => 401)
        );
    }

    // Obtener los datos de la orden desde el request
    $order_data = $request->get_json_params();

    if (!$order_data) {
        return new WP_Error(
            'invalid_data',
            'Datos de orden inválidos',
            array('status' => 400)
        );
    }

    // Validar que el usuario del token coincida con el customer_id
    if (isset($order_data['customer_id']) && $order_data['customer_id'] != $user_id) {
        return new WP_Error(
            'unauthorized',
            'No autorizado para crear órdenes para otro usuario',
            array('status' => 403)
        );
    }

    // Asegurar que el customer_id sea del usuario autenticado
    $order_data['customer_id'] = $user_id;

    try {
        // Crear la orden usando WooCommerce
        $order = wc_create_order($order_data);

        if (is_wp_error($order)) {
            return new WP_Error(
                'order_creation_failed',
                $order->get_error_message(),
                array('status' => 500)
            );
        }

        // Agregar los line items
        if (isset($order_data['line_items']) && is_array($order_data['line_items'])) {
            foreach ($order_data['line_items'] as $item) {
                $order->add_product(
                    wc_get_product($item['product_id']),
                    $item['quantity']
                );
            }
        }

        // Establecer direcciones
        if (isset($order_data['billing'])) {
            $order->set_address($order_data['billing'], 'billing');
        }

        if (isset($order_data['shipping'])) {
            $order->set_address($order_data['shipping'], 'shipping');
        }

        // Establecer el método de pago
        if (isset($order_data['payment_method'])) {
            $order->set_payment_method($order_data['payment_method']);
        }

        if (isset($order_data['payment_method_title'])) {
            $order->set_payment_method_title($order_data['payment_method_title']);
        }

        // Calcular totales
        $order->calculate_totals();

        // Guardar la orden
        $order->save();

        // Retornar la orden creada
        return new WP_REST_Response(array(
            'id' => $order->get_id(),
            'order_key' => $order->get_order_key(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'currency' => $order->get_currency(),
            'date_created' => $order->get_date_created()->date('c'),
            'total' => $order->get_total(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title(),
            'billing' => $order->get_address('billing'),
            'shipping' => $order->get_address('shipping'),
            'line_items' => array_map(function($item) {
                return array(
                    'id' => $item->get_id(),
                    'name' => $item->get_name(),
                    'product_id' => $item->get_product_id(),
                    'quantity' => $item->get_quantity(),
                    'total' => $item->get_total()
                );
            }, $order->get_items())
        ), 201);

    } catch (Exception $e) {
        return new WP_Error(
            'order_creation_exception',
            'Error al crear la orden: ' . $e->getMessage(),
            array('status' => 500)
        );
    }
}

/**
 * Obtener órdenes del usuario autenticado
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function shop_get_user_orders_secure($request) {
    $user_id = shop_get_current_user_from_jwt($request);

    if (!$user_id) {
        return new WP_Error(
            'invalid_user',
            'No se pudo identificar al usuario',
            array('status' => 401)
        );
    }

    // Obtener órdenes del usuario
    $orders = wc_get_orders(array(
        'customer_id' => $user_id,
        'limit' => 20,
        'orderby' => 'date',
        'order' => 'DESC'
    ));

    $formatted_orders = array();

    foreach ($orders as $order) {
        $formatted_orders[] = array(
            'id' => $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'date_created' => $order->get_date_created()->date('c'),
            'total' => $order->get_total(),
            'payment_method' => $order->get_payment_method(),
            'payment_method_title' => $order->get_payment_method_title()
        );
    }

    return new WP_REST_Response($formatted_orders, 200);
}

/**
 * Verificar si el usuario compró un producto
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function shop_check_user_purchased_product($request) {
    $user_id = shop_get_current_user_from_jwt($request);

    if (!$user_id) {
        return new WP_Error(
            'invalid_user',
            'No se pudo identificar al usuario',
            array('status' => 401)
        );
    }

    $product_id = $request->get_param('product_id');

    if (!$product_id) {
        return new WP_Error(
            'invalid_product',
            'ID de producto inválido',
            array('status' => 400)
        );
    }

    // Verificar si el usuario compró el producto
    $has_purchased = wc_customer_bought_product('', $user_id, $product_id);

    return new WP_REST_Response(array(
        'has_purchased' => $has_purchased
    ), 200);
}

/**
 * Agregar configuración CORS para el frontend Angular
 */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        // Configurar tus dominios permitidos aquí
        $allowed_origins = array(
            'http://localhost:4200',
            'http://localhost:4201',
            'https://tu-dominio.com'
        );

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (in_array($origin, $allowed_origins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');
        }

        return $value;
    });
}, 15);

/**
 * Manejo de OPTIONS requests (preflight)
 */
add_action('init', function () {
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit;
    }
});
