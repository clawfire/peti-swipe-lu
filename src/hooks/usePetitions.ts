
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Petition } from "@/types/petition";

// Fisher-Yates shuffle algorithm to randomize array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePetitions = () => {
  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions from Supabase...');
      const { data, error } = await supabase
        .from('petitions')
        .select('*')
        .in('status', ['SIGNATURE_EN_COURS', 'SEUIL_ATTEINT'])
        .order('filing_date', { ascending: false });

      if (error) {
        console.error('Error fetching petitions:', error);
        throw error;
      }

      console.log('Fetched petitions:', data);
      // Randomize the order of petitions
      const randomizedPetitions = shuffleArray(data || []);
      console.log('Randomized petitions order');
      return randomizedPetitions;
    }
  });
};
