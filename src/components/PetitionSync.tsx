
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { usePetitionSync } from "@/hooks/usePetitionSync";
import { useQueryClient } from "@tanstack/react-query";

const PetitionSync = () => {
  const { syncPetitions, isLoading } = usePetitionSync();
  const queryClient = useQueryClient();

  const handleSync = async () => {
    const success = await syncPetitions();
    if (success) {
      // Invalidate petitions query to refetch data
      queryClient.invalidateQueries({ queryKey: ['petitions'] });
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Petition Data Sync
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Sync latest petitions from Luxembourg government API
          </p>
        </div>
        
        <Button 
          onClick={handleSync}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        This replaces the old CSV import system and fetches data directly from the official Luxembourg petitions API.
        The sync handles duplicate prevention automatically.
      </div>
    </Card>
  );
};

export default PetitionSync;
