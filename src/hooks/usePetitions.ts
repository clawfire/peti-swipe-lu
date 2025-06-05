
import { useQuery } from "@tanstack/react-query";
import { Petition } from "@/types/petition";
import { useToast } from "@/hooks/use-toast";

export const usePetitions = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions directly from Luxembourg API...');
      
      try {
        // Fetch petitions directly from Luxembourg government API
        const response = await fetch('https://data.public.lu/api/1/datasets/petitions-publiques/');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched data from Luxembourg API:', data);

        // For now, return empty array until we understand the actual API structure
        // We'll need to see the actual API response to properly parse it
        if (data.petitions && Array.isArray(data.petitions)) {
          const petitions = data.petitions.map((petition: any, index: number) => ({
            id: petition.id?.toString() || `petition-${index}`,
            petition_nbr: petition.petition_nbr || index + 1,
            filing_date: petition.filing_date || new Date().toISOString().split('T')[0],
            official_title: petition.official_title || petition.title || 'No title available',
            type: petition.type || 'PUBLIC',
            status: petition.status || 'SIGNATURE_EN_COURS',
            association_role: petition.association_role || null,
            association_name: petition.association_name || null,
            residency_country: petition.residency_country || 'Luxembourg',
            goal: petition.goal || null,
            sign_nbr_electronic: petition.sign_nbr_electronic || 0,
            sign_nbr_paper: petition.sign_nbr_paper || 0,
            motivation: petition.motivation || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          // Filter for active petitions only
          const activePetitions = petitions.filter((petition: Petition) => 
            petition.status === 'SIGNATURE_EN_COURS' || petition.status === 'SEUIL_ATTEINT'
          );

          console.log('Parsed and filtered petitions:', activePetitions.length);
          return activePetitions;
        }

        // If the API structure is different, return empty array for now
        console.log('No petitions found in API response or unexpected structure');
        return [];

      } catch (error) {
        console.error('Error fetching petitions from API:', error);
        toast({
          title: "Error fetching petitions",
          description: "Failed to load petitions from the Luxembourg government API",
          variant: "destructive"
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
