
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

  // Use official_title if available, otherwise fall back to title
  const displayTitle = petition.official_title || petition.title || '';

  return (
    <>
      <Card className="w-80 bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 flex flex-col">
          {/* Title with better truncation */}
          <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight line-clamp-3">
            {displayTitle}
          </h2>

          {/* Content area */}
          <div className="mb-4">
            <PetitionCardContent
              goal={petition.goal}
              associationName={petition.association_name}
              associationRole={petition.association_role}
              motivation={petition.motivation}
              onShowMore={handleShowMoreClick}
            />
          </div>

          {/* Signatures */}
          <div className="mb-4">
            <PetitionCardSignatures
              signElectronic={petition.sign_nbr_electronic}
              signPaper={petition.sign_nbr_paper}
              status={petition.status}
              filingDate={petition.filing_date}
              signaturesRequired={petition.signatures_required}
            />
          </div>

          {/* Footer */}
          <div>
            <PetitionCardFooter 
              signatureEndDate={petition.signature_end_date}
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
