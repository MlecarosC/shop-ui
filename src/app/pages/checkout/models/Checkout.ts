import { WCAddress } from '../../../core/models/woocommerce/wc-cart.model';

export interface CheckoutData {
  billingAddress: WCAddress;
  paymentMethod: 'mercadopago' | 'transbank' | 'facto' | '';
  termsAccepted: boolean;
}

export interface OrderSummaryItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}
