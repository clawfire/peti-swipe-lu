
import { useQuery } from "@tanstack/react-query";
import { Petition } from "@/types/petition";
import { useToast } from "@/hooks/use-toast";

export const usePetitions = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions from Luxembourg API...');
      
      try {
        // Fetch petitions directly from Luxembourg government API
        const response = await fetch('https://www.petitiounen.lu/petition-web-back-for-front/petitions', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch from API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data);

        // Check if data is an array or has a petitions property
        let petitionsData: any[] = [];
        
        if (Array.isArray(data)) {
          petitionsData = data;
        } else if (data.petitions && Array.isArray(data.petitions)) {
          petitionsData = data.petitions;
        } else if (data.data && Array.isArray(data.data)) {
          petitionsData = data.data;
        } else {
          console.warn('Unexpected API response structure:', data);
          return [];
        }

        console.log('Found petitions data:', petitionsData.length, 'items');

        // Map the API response to our Petition interface
        const petitions: Petition[] = petitionsData.map((petition: any, index: number) => {
          console.log('Processing petition:', petition);
          
          return {
            id: petition.id?.toString() || petition.petitionId?.toString() || `petition-${index}`,
            petition_nbr: petition.petitionNumber || petition.petition_nbr || petition.number || index + 1,
            filing_date: petition.filingDate || petition.filing_date || petition.createdAt || petition.created_at || new Date().toISOString().split('T')[0],
            official_title: petition.title || petition.official_title || petition.name || petition.subject || 'No title available',
            type: petition.type || petition.petitionType || 'PUBLIC',
            status: petition.status || petition.state || 'SIGNATURE_EN_COURS',
            association_role: petition.associationRole || petition.association_role || null,
            association_name: petition.associationName || petition.association_name || petition.organization || null,
            residency_country: petition.residencyCountry || petition.residency_country || petition.country || 'Luxembourg',
            goal: petition.goal || petition.objective || petition.description || null,
            sign_nbr_electronic: petition.electronicSignatures || petition.sign_nbr_electronic || petition.signatureCount || 0,
            sign_nbr_paper: petition.paperSignatures || petition.sign_nbr_paper || 0,
            motivation: petition.motivation || petition.reason || petition.details || null,
            created_at: petition.createdAt || petition.created_at || new Date().toISOString(),
            updated_at: petition.updatedAt || petition.updated_at || new Date().toISOString()
          };
        });

        console.log('Mapped petitions:', petitions);

        // Filter for active petitions only
        const activePetitions = petitions.filter((petition: Petition) => 
          petition.status === 'SIGNATURE_EN_COURS' || 
          petition.status === 'SEUIL_ATTEINT' ||
          petition.status === 'ACTIVE' ||
          petition.status === 'OPEN'
        );

        console.log('Active petitions after filtering:', activePetitions.length);
        
        if (activePetitions.length === 0) {
          console.log('No active petitions found, returning all petitions');
          return petitions; // Return all petitions if no active ones found
        }

        return activePetitions;

      } catch (error) {
        console.error('Error fetching petitions from API:', error);
        
        // Check if it's a CORS error
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error('Likely CORS error - API might not allow browser requests');
          toast({
            title: "API Access Error",
            description: "Unable to access the Luxembourg petitions API directly from the browser due to CORS restrictions.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error fetching petitions",
            description: "Failed to load petitions from the Luxembourg government API",
            variant: "destructive"
          });
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: (failureCount, error) => {
      // Don't retry CORS errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
