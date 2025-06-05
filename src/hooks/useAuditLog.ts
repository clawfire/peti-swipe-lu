
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  id: string;
  operation: string;
  table_name: string;
  record_id: string | null;
  user_id: string | null;
  details: any;
  timestamp: string;
}

export const useAuditLog = (recordId?: string) => {
  return useQuery({
    queryKey: ['audit-log', recordId],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      console.log('Fetching audit log entries...');
      
      let query = supabase
        .from('petition_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (recordId) {
        query = query.eq('record_id', recordId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit log:', error);
        throw error;
      }

      console.log('Audit log entries fetched:', data?.length || 0);
      return data || [];
    },
    enabled: true
  });
};
