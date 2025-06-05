
import { Calendar } from "lucide-react";
import { differenceInDays, addDays, parseISO, isValid } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardFooterProps {
  filingDate: string;
  petitionNumber: number;
}

const PetitionCardFooter = ({ filingDate, petitionNumber }: PetitionCardFooterProps) => {
  const { t } = useTranslation();
  
  const calculateRemainingDays = (dateString: string) => {
    try {
      console.log('Original filing date string:', dateString);
      
      // Parse the date string more reliably
      const filing = parseISO(dateString);
      console.log('Parsed filing date:', filing);
      
      if (!isValid(filing)) {
        console.error('Invalid filing date:', dateString);
        return 0;
      }
      
      const deadline = addDays(filing, 42); // 6 weeks = 42 days
      const today = new Date();
      
      console.log('Filing date:', filing.toISOString());
      console.log('Deadline:', deadline.toISOString());
      console.log('Today:', today.toISOString());
      
      const remainingDays = differenceInDays(deadline, today);
      console.log('Calculated remaining days:', remainingDays);
      
      return Math.max(0, remainingDays); // Don't show negative days
    } catch (error) {
      console.error('Error calculating remaining days:', error);
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
    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 flex-shrink-0" />
        <span>{getDisplayText()}</span>
      </div>
      <span>#{petitionNumber}</span>
    </div>
  );
};

export default PetitionCardFooter;
