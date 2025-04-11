
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// VIP pricing structure
export interface VipPricing {
  monthly: number;
  semiannual: number;
  annual: number;
  loaded: boolean;
}

// Default prices if database fetch fails
const DEFAULT_PRICES = {
  monthly: 4.99,
  semiannual: 24.95,
  annual: 35.99,
  loaded: false
};

/**
 * Hook for managing VIP subscription prices from database
 */
export const useVipPricing = () => {
  const [prices, setPrices] = useState<VipPricing>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
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
        console.error('Error loading VIP prices from database:', dbError);
        
        // After multiple retries, use default prices
        if (retryCount >= 2) {
          setPrices({
            ...DEFAULT_PRICES,
            loaded: true
          });
        } else {
          // Increment retry counter
          setRetryCount(prev => prev + 1);
          throw dbError;
        }
      } else if (data) {
        // Calculate semi-annual price (6 months) as 55% of yearly price
        const monthlyPrice = parseFloat(String(data.monthly_vip_price)) || DEFAULT_PRICES.monthly;
        const yearlyPrice = parseFloat(String(data.yearly_vip_price)) || DEFAULT_PRICES.annual;
        const semiannualPrice = Number((yearlyPrice * 0.55).toFixed(2));
        
        setPrices({
          monthly: monthlyPrice,
          semiannual: semiannualPrice,
          annual: yearlyPrice,
          loaded: true
        });
        
        // Reset retry counter on success
        setRetryCount(0);
      } else {
        // Fallback to default prices if no data
        setPrices({
          ...DEFAULT_PRICES,
          loaded: true
        });
      }
    } catch (err) {
      console.error('Error loading VIP prices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading VIP prices');
      
      // Schedule retry with exponential backoff if under retry limit
      if (retryCount < 3) {
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 5000);
        setTimeout(() => loadPrices(), backoffTime);
      } else {
        // Use default prices if max retries reached
        setPrices({
          ...DEFAULT_PRICES,
          loaded: true
        });
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);
  
  // Load prices on initial mount
  useEffect(() => {
    loadPrices();
  }, [loadPrices]);
  
  // Format price with currency symbol
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };
  
  // Create formatted price getters
  const monthlyPrice = formatPrice(prices.monthly);
  const semiannualPrice = formatPrice(prices.semiannual);
  const annualPrice = formatPrice(prices.annual);
  
  // Return pricing data and utility functions
  return {
    prices,
    loading,
    error,
    refresh: loadPrices,
    formatPrice,
    monthlyPrice,
    semiannualPrice,
    annualPrice
  };
};
