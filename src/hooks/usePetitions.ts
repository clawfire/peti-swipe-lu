
import { useQuery } from "@tanstack/react-query";
import { Petition } from "@/types/petition";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePetitions = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions via Supabase Edge Function...');
      
      try {
        // Use Supabase Edge Function to fetch petitions (bypasses CORS)
        const { data, error } = await supabase.functions.invoke('fetch-petitions');
        
        if (error) {
          console.error('Edge function error:', error);
          throw new Error(`Edge function failed: ${error.message}`);
        }

        if (!data || !Array.isArray(data)) {
          console.error('Invalid response from edge function:', data);
          throw new Error('Invalid response format from petition service');
        }

        console.log(`Successfully fetched ${data.length} petitions via Edge Function`);
        return data as Petition[];

      } catch (error) {
        console.error('Error fetching petitions:', error);
        
        toast({
          title: "Error fetching petitions",
          description: "Failed to load petitions from the Luxembourg government API",
          variant: "destructive"
        });
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 3,
  });
};
