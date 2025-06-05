
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Petition } from "@/types/petition";
import PetitionDetailModal from "./PetitionDetailModal";
import PetitionCardSignatures from "./PetitionCardSignatures";
import PetitionCardContent from "./PetitionCardContent";
import PetitionCardFooter from "./PetitionCardFooter";

interface PetitionCardProps {
  petition: Petition;
}

const PetitionCard = ({ petition }: PetitionCardProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleShowMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Show more button clicked');
    setShowDetailModal(true);
  };

  return (
    <>
      <Card className="w-80 h-[600px] bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 h-full flex flex-col">
          {/* Title with better truncation */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight flex-shrink-0 line-clamp-3 min-h-0">
            {petition.official_title}
          </h2>

          {/* Content area with constrained height and overflow handling */}
          <div className="flex-1 min-h-0 overflow-hidden mb-4">
            <PetitionCardContent
              goal={petition.goal}
              associationName={petition.association_name}
              associationRole={petition.association_role}
              motivation={petition.motivation}
              onShowMore={handleShowMoreClick}
            />
          </div>

          {/* Signatures - always visible */}
          <div className="flex-shrink-0">
            <PetitionCardSignatures
              signElectronic={petition.sign_nbr_electronic}
              signPaper={petition.sign_nbr_paper}
              status={petition.status}
              filingDate={petition.filing_date}
            />
          </div>

          {/* Footer - always visible */}
          <div className="flex-shrink-0">
            <PetitionCardFooter 
              filingDate={petition.filing_date} 
              petitionNumber={petition.petition_nbr}
            />
          </div>
        </div>
      </Card>

      <PetitionDetailModal 
        petition={petition}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
      />
    </>
  );
};

export default PetitionCard;
