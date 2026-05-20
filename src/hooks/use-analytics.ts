declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-BFDJKVPZP2';

export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const event = (action: string, params: Record<string, any>) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, params);
  }
};

// E-commerce events
export const viewItem = (item: {
  item_id: string;
  item_name: string;
  price: number;
  item_category?: string;
}) => {
  event('view_item', {
    currency: 'BRL',
    value: item.price,
    items: [item],
  });
};

export const addToCart = (item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
}) => {
  event('add_to_cart', {
    currency: 'BRL',
    value: item.price * item.quantity,
    items: [item],
  });
};

export const removeFromCart = (item: {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}) => {
  event('remove_from_cart', {
    currency: 'BRL',
    value: item.price * item.quantity,
    items: [item],
  });
};

export const beginCheckout = (items: Array<{
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}>, total: number) => {
  event('begin_checkout', {
    currency: 'BRL',
    value: total,
    items: items,
  });
};

export const purchase = (transaction_id: string, items: Array<{
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}>, total: number) => {
  event('purchase', {
    transaction_id,
    currency: 'BRL',
    value: total,
    items: items,
  });
};

export const search = (search_term: string) => {
  event('search', { search_term });
};
