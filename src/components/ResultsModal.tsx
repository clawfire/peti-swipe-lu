
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, RefreshCw, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Petition } from "@/types/petition";

interface ResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likedPetitions: Petition[];
  onReset: () => void;
  onResetAll?: () => void; // New prop for resetting all swiped petitions
}

const ResultsModal = ({ open, onOpenChange, likedPetitions, onReset, onResetAll }: ResultsModalProps) => {
  const { t, language } = useTranslation();
  
  const getSignUrlPath = (lang: string) => {
    switch (lang) {
      case 'fr':
        return 'signer';
      case 'en':
        return 'sign';
      case 'de':
        return 'unterschreiben';
      default:
        return 'signer';
    }
  };
  
  const handleSignPetition = (petitionNumber: number) => {
    // Construct URL based on selected language
    const urlPath = getSignUrlPath(language);
    const url = `https://www.petitiounen.lu/${language}/${urlPath}/${petitionNumber}`;
    window.open(url, '_blank');
  };

  const handleStartOverAndClose = () => {
    if (onResetAll) {
      onResetAll();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-pink-500" />
            {t('results.title')}
          </DialogTitle>
        </DialogHeader>

        {likedPetitions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('results.none')}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => onOpenChange(false)}>
                {t('results.continue')}
              </Button>
              {onResetAll && (
                <Button 
                  variant="outline" 
                  onClick={handleStartOverAndClose}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t('results.startOver')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              {t('results.selected')} {likedPetitions.length} {likedPetitions.length > 1 ? t('results.petitions') : t('results.petition')} {t('results.toSign')}
            </p>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {likedPetitions.map((petition) => {
                const totalSignatures = (petition.sign_nbr_electronic || 0) + (petition.sign_nbr_paper || 0);
                
                return (
                  <div key={petition.id} className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-purple-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                        {petition.official_title}
                      </h3>
                      <Badge variant="outline" className="ml-2">
                        #{petition.petition_nbr}
                      </Badge>
                    </div>
                    
                    {petition.goal && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {petition.goal}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{totalSignatures.toLocaleString()} {t('petition.signatures').toLowerCase()}</span>
                      </div>
                      
                      <Button 
                        onClick={() => handleSignPetition(petition.petition_nbr)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600"
                        size="sm"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('results.sign')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              {onResetAll && (
                <Button 
                  onClick={handleStartOverAndClose}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('results.startOver')}
                </Button>
              )}
              <Button 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                {t('results.continue')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
