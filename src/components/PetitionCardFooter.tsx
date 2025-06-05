
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardFooterProps {
  filingDate: string;
}

const PetitionCardFooter = ({ filingDate }: PetitionCardFooterProps) => {
  const { t, language } = useTranslation();

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'de': return de;
      default: return fr;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: getDateLocale() });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
      <Calendar className="w-4 h-4" />
      <span>{t('petition.filed')} {formatDate(filingDate)}</span>
    </div>
  );
};

export default PetitionCardFooter;
