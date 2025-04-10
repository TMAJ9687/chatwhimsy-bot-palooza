
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// VIP pricing structure
interface VipPricing {
  monthly: number;
  semiannual: number;
  annual: number;
  loaded: boolean;
}

// Default prices if database fetch fails
const DEFAULT_PRICES = {
  monthly: 9.99,
  semiannual: 49.99,
  annual: 99.99,
  loaded: false
};

/**
 * Hook for managing VIP subscription prices from database
 */
export const useVipPricing = () => {
  const [prices, setPrices] = useState<VipPricing>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load prices from database
  const loadPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch prices from site_settings table
      const { data, error: dbError } = await supabase
        .from('site_settings')
        .select('monthly_vip_price, yearly_vip_price')
        .limit(1)
        .single();
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      if (data) {
        // Calculate semi-annual price (6 months) as 45% of yearly price
        const monthlyPrice = parseFloat(data.monthly_vip_price) || DEFAULT_PRICES.monthly;
        const yearlyPrice = parseFloat(data.yearly_vip_price) || DEFAULT_PRICES.annual;
        const semiannualPrice = yearlyPrice * 0.55;
        
        setPrices({
          monthly: monthlyPrice,
          semiannual: semiannualPrice,
          annual: yearlyPrice,
          loaded: true
        });
      }
    } catch (err) {
      console.error('Error loading VIP prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading VIP prices');
      
      // Use default prices if there's an error
      setPrices({
        ...DEFAULT_PRICES,
        loaded: true
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load prices on initial mount
  useEffect(() => {
    loadPrices();
  }, [loadPrices]);
  
  // Format price with currency symbol
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };
  
  // Return pricing data and utility functions
  return {
    prices,
    loading,
    error,
    refresh: loadPrices,
    formatPrice,
    monthlyPrice: formatPrice(prices.monthly),
    semiannualPrice: formatPrice(prices.semiannual),
    annualPrice: formatPrice(prices.annual)
  };
};
