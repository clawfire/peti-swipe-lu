
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Petition } from "@/types/petition";
import { handleSecurityError, logSecurityEvent } from "@/utils/securityUtils";

export const usePetitions = () => {
  return useQuery({
    queryKey: ['petitions'],
    queryFn: async (): Promise<Petition[]> => {
      console.log('Fetching petitions from Supabase with date filter and security checks...');
      
      // Log the data access attempt for security monitoring
      logSecurityEvent('PETITION_DATA_ACCESS_ATTEMPT', {
        timestamp: new Date().toISOString(),
        operation: 'SELECT',
      });
      
      try {
        const { data, error } = await supabase
          .from('petitions')
          .select('*')
          .in('status', ['SIGNATURE_EN_COURS', 'SEUIL_ATTEINT'])
          .gte('filing_date', new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Only petitions filed within last 42 days
          .order('id', { ascending: false }); // Order by ID descending (most recent first)

        if (error) {
          console.error('Error fetching petitions:', error);
          
          // Use centralized security error handling
          handleSecurityError({
            code: error.code,
            message: error.message,
            details: error.details
          });
          
          // Log the security error for monitoring
          logSecurityEvent('PETITION_DATA_ACCESS_ERROR', {
            error: error.code,
            message: error.message,
            timestamp: new Date().toISOString(),
          });
          
          throw error;
        }

        console.log('Fetched recent petitions (within 42 days):', data?.length || 0);
        
        // Log successful data access for audit purposes
        logSecurityEvent('PETITION_DATA_ACCESS_SUCCESS', {
          recordCount: data?.length || 0,
          timestamp: new Date().toISOString(),
        });
        
        return data || [];
        
      } catch (error) {
        console.error('Failed to fetch petitions:', error);
        
        // Log unexpected errors for security monitoring
        logSecurityEvent('PETITION_DATA_ACCESS_UNEXPECTED_ERROR', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on security policy violations
      if (error?.code === '42501' || error?.code === 'PGRST301') {
        logSecurityEvent('PETITION_DATA_ACCESS_RETRY_BLOCKED', {
          failureCount,
          errorCode: error?.code,
        });
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });
};
