
import { Calendar } from "lucide-react";
import { differenceInDays, parseISO, isValid } from "date-fns";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardFooterProps {
  signatureEndDate?: string | null;
  filingDate: string;
  petitionNumber: number;
}

const PetitionCardFooter = ({ signatureEndDate, filingDate, petitionNumber }: PetitionCardFooterProps) => {
  const { t } = useTranslation();
  
  const calculateRemainingDays = (endDateString?: string | null, fallbackFilingDate?: string) => {
    try {
      let targetDate: Date;
      
      // Use signature_end_date if available, otherwise calculate 42 days from filing_date
      if (endDateString && endDateString.trim() !== '') {
        console.log('Using signature end date:', endDateString);
        targetDate = parseISO(endDateString);
        
        if (!isValid(targetDate)) {
          console.warn('Invalid signature end date, falling back to filing date calculation');
          const filing = parseISO(fallbackFilingDate || '');
          if (!isValid(filing)) {
            console.error('Invalid filing date:', fallbackFilingDate);
            return 0;
          }
          // Add 42 days to filing date as fallback
          targetDate = new Date(filing.getTime() + (42 * 24 * 60 * 60 * 1000));
        }
      } else {
        console.log('No signature end date, calculating from filing date:', fallbackFilingDate);
        const filing = parseISO(fallbackFilingDate || '');
        if (!isValid(filing)) {
          console.error('Invalid filing date:', fallbackFilingDate);
          return 0;
        }
        // Add 42 days to filing date
        targetDate = new Date(filing.getTime() + (42 * 24 * 60 * 60 * 1000));
      }
      
      const today = new Date();
      
      console.log('Target date:', targetDate.toISOString());
      console.log('Today:', today.toISOString());
      
      const remainingDays = differenceInDays(targetDate, today);
      console.log('Calculated remaining days:', remainingDays);
      
      return Math.max(0, remainingDays); // Don't show negative days
    } catch (error) {
      console.error('Error calculating remaining days:', error);
      return 0;
    }
  };

  const remainingDays = calculateRemainingDays(signatureEndDate, filingDate);

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
