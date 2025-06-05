
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Petition } from "@/types/petition";

export const usePetitions = () => {
  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions from Supabase...');
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .in('status', ['SIGNATURE_EN_COURS', 'SEUIL_ATTEINT'])
        .order('id', { ascending: false }); // Order by ID descending (most recent first)

      if (error) {
        console.error('Error fetching petitions:', error);
        throw error;
      }

      console.log('Fetched petitions ordered by most recent:', data);
      return data || [];
    }
  });
};
