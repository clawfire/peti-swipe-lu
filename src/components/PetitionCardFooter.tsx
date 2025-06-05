
import { Calendar } from "lucide-react";
import { differenceInDays, addDays } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardFooterProps {
  filingDate: string;
}

const PetitionCardFooter = ({ filingDate }: PetitionCardFooterProps) => {
  const { t } = useTranslation();
  
  const calculateRemainingDays = (dateString: string) => {
    try {
      const filingDate = new Date(dateString);
      const deadline = addDays(filingDate, 42); // 6 weeks = 42 days
      const today = new Date();
      const remainingDays = differenceInDays(deadline, today);
      
      return Math.max(0, remainingDays); // Don't show negative days
    } catch {
      return 0;
    }
  };

  const remainingDays = calculateRemainingDays(filingDate);

  const getDisplayText = () => {
    if (remainingDays === 0) {
      return t('petition.lastDay');
    } else if (remainingDays === 1) {
      return `1 ${t('petition.dayLeft')}`;
    } else {
      return `${remainingDays} ${t('petition.daysLeft')}`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
      <Calendar className="w-4 h-4" />
      <span>{getDisplayText()}</span>
    </div>
  );
};

export default PetitionCardFooter;
