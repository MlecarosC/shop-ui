/**
 * WordPress User
 */
export interface WPUser {
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
  capabilities: {
    [key: string]: boolean;
  };
  extra_capabilities: {
    [key: string]: boolean;
  };
  avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  meta: any[];
  _links?: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

/**
 * Update User Request
 */
export interface WPUpdateUserRequest {
  username?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  url?: string;
  description?: string;
  locale?: string;
  nickname?: string;
  slug?: string;
  roles?: string[];
  password?: string;
  meta?: any;
}

/**
 * WordPress User Context
 */
export type WPUserContext = 'view' | 'embed' | 'edit';
