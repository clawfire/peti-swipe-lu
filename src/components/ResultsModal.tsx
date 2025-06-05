
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, RotateCcw, Users } from "lucide-react";

interface Petition {
  PETITION_NBR: number;
  FILING_DATE: string;
  OFFICIAL_TITLE: string;
  TYPE: string;
  STATUS: string;
  ASSOCIATION_ROLE?: string | null;
  ASSOCIATION_NAME?: string | null;
  RESIDENCY_COUNTRY: string;
  GOAL?: string | null;
  SIGN_NBR_ELECTRONIC?: number | null;
  SIGN_NBR_PAPER?: number | null;
  MOTIVATION?: string | null;
}

interface ResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likedPetitions: Petition[];
  onReset: () => void;
}

const ResultsModal = ({ open, onOpenChange, likedPetitions, onReset }: ResultsModalProps) => {
  const handleSignPetition = (petitionNumber: number) => {
    // Open petition page on petitions.lu
    window.open(`https://petitions.lu/petition/${petitionNumber}`, '_blank');
  };

  const handleResetAndClose = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-pink-500" />
            Vos pétitions sélectionnées
          </DialogTitle>
        </DialogHeader>

        {likedPetitions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Aucune pétition sélectionnée pour le moment.</p>
            <Button onClick={() => onOpenChange(false)}>
              Continuer à parcourir
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous avez sélectionné {likedPetitions.length} pétition{likedPetitions.length > 1 ? 's' : ''} à signer.
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {likedPetitions.map((petition) => {
                const totalSignatures = (petition.SIGN_NBR_ELECTRONIC || 0) + (petition.SIGN_NBR_PAPER || 0);
                
                return (
                  <div key={petition.PETITION_NBR} className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-purple-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {petition.OFFICIAL_TITLE}
                      </h3>
                      <Badge variant="outline" className="ml-2">
                        #{petition.PETITION_NBR}
                      </Badge>
                    </div>
                    
                    {petition.GOAL && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {petition.GOAL}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{totalSignatures.toLocaleString()} signatures</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleSignPetition(petition.PETITION_NBR)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Signer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleResetAndClose}
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Recommencer
              </Button>
              <Button 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Continuer à parcourir
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
