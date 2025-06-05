
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Petition } from "@/types/petition";
import { useRateLimit } from "./useRateLimit";
import { useToast } from "@/hooks/use-toast";

export const usePetitions = () => {
  const { checkRateLimit } = useRateLimit();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions from Supabase with date filter...');
      
      // Check rate limit before making the request
      const clientIP = 'anonymous'; // In a real app, you'd get the actual IP
      const isAllowed = await checkRateLimit({
        identifier: clientIP,
        endpoint: 'fetch_petitions',
        limit: 10, // Allow 10 requests per hour for fetching petitions
        windowMinutes: 60
      });

      if (!isAllowed) {
        toast({
          title: "Rate limit exceeded",
          description: "Too many requests. Please try again later.",
          variant: "destructive"
        });
        throw new Error('Rate limit exceeded');
      }

      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .in('status', ['SIGNATURE_EN_COURS', 'SEUIL_ATTEINT'])
        .gte('filing_date', new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Only petitions filed within last 42 days
        .order('id', { ascending: false }); // Order by ID descending (most recent first)

      if (error) {
        console.error('Error fetching petitions:', error);
        throw error;
      }

      console.log('Fetched recent petitions (within 42 days):', data?.length || 0);
      return data || [];
    }
  });
};
