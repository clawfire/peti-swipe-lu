
import { useQuery } from "@tanstack/react-query";
import { Petition } from "@/types/petition";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaginationParams {
  page?: number;
  size?: number;
  language?: string;
}

interface PetitionsResponse {
  petitions: Petition[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const usePetitions = (params: PaginationParams = {}) => {
  const { toast } = useToast();
  const { page = 0, size = 10, language = 'FR' } = params;

  return useQuery({
    queryKey: ['petitions', page, size, language],
    queryFn: async (): Promise<PetitionsResponse> => {
      console.log(`Fetching petitions via Supabase Edge Function (page: ${page}, size: ${size}, language: ${language})...`);
      
      try {
        // Use Supabase Edge Function to fetch petitions with query parameters
        const { data, error } = await supabase.functions.invoke('fetch-petitions', {
          body: {}, // Empty body since we're using query parameters
          headers: {
            'Content-Type': 'application/json',
          },
          // Pass parameters as query string
          ...(page !== undefined || size !== undefined || language !== undefined) && {
            method: 'GET',
          }
        });

        // Construct URL with query parameters manually since Supabase client doesn't support query params in invoke
        const url = new URL(`https://vxffkawfnjlltqnhekvl.supabase.co/functions/v1/fetch-petitions`);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('size', size.toString());
        url.searchParams.set('language', language.toUpperCase());

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZmZrYXdmbmpsbHRxbmhla3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTc2OTcsImV4cCI6MjA2NDY5MzY5N30.i6qewG644fiBDDBkXb3NQKjU4KWF0S24gYOh6hzi8Xo`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Edge function failed: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        
        if (responseData.error) {
          console.error('Edge function error:', responseData.error);
          throw new Error(`Edge function failed: ${responseData.message}`);
        }

        if (!responseData.petitions || !Array.isArray(responseData.petitions)) {
          console.error('Invalid response from edge function:', responseData);
          throw new Error('Invalid response format from petition service');
        }

        console.log(`Successfully fetched ${responseData.petitions.length} petitions via Edge Function`);
        return responseData as PetitionsResponse;

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
