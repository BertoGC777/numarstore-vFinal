import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCoupon } from '@/context/CouponContext';
import { Check, X } from 'lucide-react';

export default function CouponInput({ subtotal }: { subtotal: number }) {
  const { appliedCoupon, discount, applyCoupon, removeCoupon } = useCoupon();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    const result = await applyCoupon(code.toUpperCase(), subtotal);
    
    if (!result.valid) {
      setError(result.error || 'Cupom inválido');
    } else {
      setCode('');
    }
    
    setLoading(false);
  };

  const handleRemove = () => {
    removeCoupon();
    setError('');
  };

  if (appliedCoupon) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-300">
                Cupom aplicado: {appliedCoupon.code}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400">
                {appliedCoupon.type === 'percentage'
                  ? `${appliedCoupon.value}% de desconto`
                  : appliedCoupon.type === 'fixed'
                  ? `R$ ${appliedCoupon.value.toFixed(2)} de desconto`
                  : 'Frete grátis'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg p-4">
      <p className="text-sm font-medium mb-2">Cupom de desconto</p>
      <div className="flex gap-2">
        <Input
          placeholder="Digite o código"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className={error ? 'border-destructive' : ''}
        />
        <Button onClick={handleApply} disabled={loading || !code.trim()}>
          {loading ? '...' : 'Aplicar'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}
