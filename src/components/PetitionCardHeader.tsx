
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardHeaderProps {
  status: string;
  petitionNumber: number;
}

const PetitionCardHeader = ({ status, petitionNumber }: PetitionCardHeaderProps) => {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNATURE_EN_COURS':
        return 'bg-blue-100 text-green-800';
      case 'SEUIL_ATTEINT':
        return 'bg-green-100 text-blue-800';
      case 'CLOTUREE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    return t(`status.${status}`) || status;
  };

  return (
    <div className="flex justify-between items-start mb-4">
      <Badge className={getStatusColor(status)}>
        {getStatusText(status)}
      </Badge>
      <span className="text-sm text-gray-500">#{petitionNumber}</span>
    </div>
  );
};

export default PetitionCardHeader;
