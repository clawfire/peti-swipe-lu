
import { supabase } from "@/integrations/supabase/client";

interface RateLimitOptions {
  identifier: string;
  endpoint: string;
  limit?: number;
  windowMinutes?: number;
}

export const useRateLimit = () => {
  const checkRateLimit = async ({ 
    identifier, 
    endpoint, 
    limit = 100, 
    windowMinutes = 60 
  }: RateLimitOptions): Promise<boolean> => {
    try {
      console.log(`Checking rate limit for ${identifier} on ${endpoint}`);
      
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_endpoint: endpoint,
        p_limit: limit,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow request on error to prevent blocking legitimate users
      }

      console.log(`Rate limit check result: ${data ? 'allowed' : 'blocked'}`);
      return data;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow request on error
    }
  };

  return { checkRateLimit };
};
