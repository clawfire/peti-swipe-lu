
import { Calendar, Users, Flame, Building2, Target, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Petition } from "@/types/petition";

interface PetitionCardProps {
  petition: Petition;
}

const PetitionCard = ({ petition }: PetitionCardProps) => {
  const [showFullMotivation, setShowFullMotivation] = useState(false);
  const { t, language } = useTranslation();
  const totalSignatures = (petition.sign_nbr_electronic || 0) + (petition.sign_nbr_paper || 0);
  const hotMeterPercentage = Math.min((totalSignatures / 5500) * 100, 100);
  const isThresholdReached = petition.status === 'SEUIL_ATTEINT';
  const isHighlyPopular = hotMeterPercentage > 80 || isThresholdReached;
  
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
    <Card className="w-80 min-h-[500px] max-h-[600px] bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="p-6 h-full flex flex-col">
        {/* Header - removed status badge */}
        <div className="flex justify-end items-start mb-4">
          <span className="text-sm text-gray-500">#{petition.petition_nbr}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
          {petition.official_title}
        </h2>

        {/* Goal */}
        {petition.goal && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{t('petition.goal')}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{petition.goal}</p>
          </div>
        )}

        {/* Association */}
        {petition.association_name && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">{t('petition.organization')}</span>
            </div>
            <p className="text-sm text-gray-600">
              {petition.association_name}
              {petition.association_role && ` (${petition.association_role})`}
            </p>
          </div>
        )}

        {/* Motivation with show more functionality */}
        {petition.motivation && (
          <div className="mb-4 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">{t('petition.motivation')}</span>
            </div>
            <div className="relative">
              <p className={`text-sm text-gray-600 ${showFullMotivation ? '' : 'line-clamp-3'}`}>
                {petition.motivation}
              </p>
              {petition.motivation.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFullMotivation(!showFullMotivation);
                  }}
                  className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent"
                >
                  {showFullMotivation ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      {t('petition.showLess')}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      {t('petition.showMore')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Hot Meter with enhanced styling */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${isHighlyPopular ? 'text-yellow-500' : 'text-orange-500'} ${isHighlyPopular ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium text-gray-700">{t('petition.popularity')}</span>
              {isThresholdReached && (
                <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold animate-pulse">
                  {t('petition.popular')}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">{totalSignatures}/5500</span>
          </div>
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isHighlyPopular ? 'shadow-lg' : ''}`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isThresholdReached 
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/50 animate-pulse' 
                  : isHighlyPopular 
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-md shadow-orange-400/30' 
                    : 'bg-gradient-to-r from-orange-400 to-red-500'
              }`}
              style={{ width: `${hotMeterPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{t('petition.signatures')}</span>
          </div>
          <div className={`text-2xl font-bold ${isThresholdReached ? 'text-orange-600' : 'text-green-600'} ${isThresholdReached ? 'animate-pulse' : ''}`}>
            {totalSignatures.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {petition.sign_nbr_electronic && `${petition.sign_nbr_electronic} ${t('petition.electronic')}`}
            {petition.sign_nbr_electronic && petition.sign_nbr_paper && ' • '}
            {petition.sign_nbr_paper && `${petition.sign_nbr_paper} ${t('petition.paper')}`}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
          <Calendar className="w-4 h-4" />
          <span>{t('petition.filed')} {formatDate(petition.filing_date)}</span>
        </div>
      </div>
    </Card>
  );
};

export default PetitionCard;
