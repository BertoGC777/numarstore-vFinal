import { createContext, useContext, useState, ReactNode } from 'react';

interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage' | 'free_shipping';
  value: number;
  min_purchase: number;
  max_discount?: number;
  valid_until?: number;
}

interface CouponContextType {
  appliedCoupon: Coupon | null;
  discount: number;
  applyCoupon: (code: string, subtotal: number) => Promise<{ valid: boolean; error?: string }>;
  removeCoupon: () => void;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export const CouponProvider = ({ children }: { children: ReactNode }) => {
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discount, setDiscount] = useState(0);

  const applyCoupon = async (code: string, subtotal: number): Promise<{ valid: boolean; error?: string }> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });

      const data = await response.json();

      if (data.valid && data.coupon) {
        setAppliedCoupon(data.coupon);
        
        // Calculate discount
        let discountAmount = 0;
        switch (data.coupon.type) {
          case 'fixed':
            discountAmount = data.coupon.value;
            break;
          case 'percentage':
            discountAmount = subtotal * (data.coupon.value / 100);
            break;
          case 'free_shipping':
            discountAmount = 0; // Will be handled in checkout
            break;
        }

        // Apply max discount limit
        if (data.coupon.max_discount && discountAmount > data.coupon.max_discount) {
          discountAmount = data.coupon.max_discount;
        }

        // Discount cannot exceed subtotal
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }

        setDiscount(Math.round(discountAmount * 100) / 100);
        return { valid: true };
      }

      return { valid: false, error: data.error };
    } catch (error) {
      return { valid: false, error: 'Erro ao validar cupom' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  return (
    <CouponContext.Provider value={{ appliedCoupon, discount, applyCoupon, removeCoupon }}>
      {children}
    </CouponContext.Provider>
  );
};

export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within CouponProvider');
  }
  return context;
};
