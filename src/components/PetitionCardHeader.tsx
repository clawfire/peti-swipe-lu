
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardHeaderProps {
  petitionNumber: number;
}

const PetitionCardHeader = ({ petitionNumber }: PetitionCardHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end items-start mb-4">
      <span className="text-sm text-gray-500">#{petitionNumber}</span>
    </div>
  );
};

export default PetitionCardHeader;
