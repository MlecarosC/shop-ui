import { WCAddress } from "./wc-cart.model";

export interface WCUser {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  registered_date: string;
  roles: string[];
  capabilities: { [key: string]: boolean };
  extra_capabilities: { [key: string]: boolean };
  avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  meta: any[];
  billing: WCAddress;
  shipping: WCAddress;
  is_paying_customer: boolean;
  avatar_url: string;
}

export interface WCAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}
