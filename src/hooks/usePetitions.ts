
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
        .eq('status', 'SIGNATURE_EN_COURS')
        .order('filing_date', { ascending: false });

      if (error) {
        console.error('Error fetching petitions:', error);
        throw error;
      }

      console.log('Fetched petitions:', data);
      return data || [];
    }
  });
};
