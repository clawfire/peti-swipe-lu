
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, Eye } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Petition } from "@/types/petition";

interface BundleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bundleLikedPetitions: Petition[];
  onGetNextBundle: () => void;
  onReviewLiked: () => void;
}

const BundleModal = ({ 
  open, 
  onOpenChange, 
  bundleLikedPetitions, 
  onGetNextBundle, 
  onReviewLiked 
}: BundleModalProps) => {
  const { t } = useTranslation();
  
  const hasLikedPetitions = bundleLikedPetitions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {hasLikedPetitions ? "Bundle Complete!" : "No matches this time"}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center py-6">
          {hasLikedPetitions ? (
            <>
              <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                You liked {bundleLikedPetitions.length} petition{bundleLikedPetitions.length > 1 ? 's' : ''} in this bundle!
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={onReviewLiked}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review Selected Petitions
                </Button>
                <Button 
                  onClick={onGetNextBundle}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Get 10 More Petitions
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">🤷</span>
              </div>
              <p className="text-gray-600 mb-6">
                No petitions caught your interest this time. That's okay!
              </p>
              <Button 
                onClick={onGetNextBundle}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try 10 More Petitions
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BundleModal;
