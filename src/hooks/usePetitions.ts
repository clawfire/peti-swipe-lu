
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
      console.log(`Fetching petitions from database (page: ${page}, size: ${size}, language: ${language})...`);
      
      try {
        // Calculate offset for pagination
        const offset = page * size;

        // Get total count first
        const { count, error: countError } = await supabase
          .from('petitions')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          throw new Error(`Failed to get petition count: ${countError.message}`);
        }

        const totalElements = count || 0;
        const totalPages = Math.ceil(totalElements / size);

        // Fetch petitions with pagination
        const { data: petitions, error } = await supabase
          .from('petitions')
          .select('*')
          .order('filing_date', { ascending: false })
          .range(offset, offset + size - 1);

        if (error) {
          throw new Error(`Failed to fetch petitions: ${error.message}`);
        }

        // Map database fields to interface and add goal field for backward compatibility
        const mappedPetitions: Petition[] = (petitions || []).map(petition => ({
          ...petition,
          // Ensure all required fields have values
          petition_nbr: petition.petition_nbr || null,
          sign_nbr_electronic: petition.sign_nbr_electronic || 0,
          sign_nbr_paper: petition.sign_nbr_paper || 0,
          // Map purpose to goal for backward compatibility
          goal: petition.purpose || null,
        }));

        const response: PetitionsResponse = {
          petitions: mappedPetitions,
          pagination: {
            page,
            size,
            totalElements,
            totalPages,
            hasNext: page < totalPages - 1,
            hasPrevious: page > 0,
          }
        };

        console.log(`Successfully fetched ${mappedPetitions.length} petitions from database`);
        return response;

      } catch (error) {
        console.error('Error fetching petitions:', error);
        
        toast({
          title: "Error fetching petitions",
          description: "Failed to load petitions from the database",
          variant: "destructive"
        });
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
};

// Hook for importing petitions from JSON file
export const useImportPetitions = () => {
  const { toast } = useToast();

  const importFromJson = async (bucketName = 'petitions-file', fileName = 'petitions.json') => {
    try {
      console.log(`Starting import from ${bucketName}/${fileName}...`);
      
      const { data, error } = await supabase.functions.invoke('import-json-petitions', {
        body: { bucketName, fileName },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        throw new Error(`Import failed: ${error.message}`);
      }

      const result = data;

      if (!result.success) {
        throw new Error(result.error || 'Import failed');
      }

      toast({
        title: "Import successful",
        description: `Successfully imported ${result.imported} petitions from JSON file`,
      });

      return result;

    } catch (error) {
      console.error('Error importing petitions:', error);
      
      toast({
        title: "Import failed",
        description: error.message || "Failed to import petitions from JSON file",
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { importFromJson };
};
