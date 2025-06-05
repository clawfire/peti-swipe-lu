
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePetitionSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const syncPetitions = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting petition sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-petitions', {
        method: 'POST'
      });

      if (error) {
        console.error('Sync error:', error);
        toast({
          title: "Sync Failed",
          description: error.message || "Failed to sync petitions from government API",
          variant: "destructive"
        });
        return false;
      }

      if (data?.success) {
        toast({
          title: "Sync Successful",
          description: `${data.processed} petitions synced from Luxembourg government API`,
          variant: "default"
        });
        return true;
      } else {
        toast({
          title: "Sync Failed", 
          description: data?.error || "Unknown error during sync",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Sync exception:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to connect to sync service",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { syncPetitions, isLoading };
};
