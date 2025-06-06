
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Flame, Building2, Target, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr, enUS, de } from "date-fns/locale";
import { useTranslation } from "@/hooks/useTranslation";
import { Petition } from "@/types/petition";

interface PetitionDetailModalProps {
  petition: Petition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PetitionDetailModal = ({ petition, open, onOpenChange }: PetitionDetailModalProps) => {
  const { t, language } = useTranslation();

  if (!petition) return null;

  const totalSignatures = (petition.sign_nbr_electronic || 0) + (petition.sign_nbr_paper || 0);
  
  // Historical threshold logic: petitions filed before March 1, 2025 use 4500 threshold
  const getThreshold = () => {
    try {
      const filing = new Date(petition.filing_date);
      const marchFirst2025 = new Date('2025-03-01');
      return filing < marchFirst2025 ? 4500 : 5500;
    } catch {
      return 5500; // Default to current threshold if date parsing fails
    }
  };

  const threshold = getThreshold();
  const hotMeterPercentage = Math.min((totalSignatures / threshold) * 100, 100);
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

  // Helper function to format signature breakdown
  const getSignatureBreakdown = () => {
    const parts = [];
    if (petition.sign_nbr_electronic && petition.sign_nbr_electronic > 0) {
      parts.push(`${petition.sign_nbr_electronic.toLocaleString()} ${t('petition.electronic')}`);
    }
    if (petition.sign_nbr_paper && petition.sign_nbr_paper > 0) {
      parts.push(`${petition.sign_nbr_paper.toLocaleString()} ${t('petition.paper')}`);
    }
    
    if (parts.length === 0) {
      return t('petition.noSignaturesYet');
    }
    
    return parts.join(' • ');
  };

  // Use official_title if available, otherwise fall back to title
  const displayTitle = petition.official_title || petition.title || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 m-0 rounded-none border-none">
        <ScrollArea className="w-full h-full">
          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {displayTitle}
            </h1>

            {/* Signature Counter - Always Visible */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isThresholdReached ? (
                    <Flame className="w-8 h-8 text-yellow-500 animate-pulse" />
                  ) : (
                    <Users className="w-8 h-8 text-green-600" />
                  )}
                  <span className="text-lg font-medium text-gray-700">{t('petition.signatures')}</span>
                  {isThresholdReached && (
                    <span className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-semibold animate-pulse">
                      {t('petition.popular')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`text-5xl font-bold ${isThresholdReached ? 'text-orange-600' : 'text-green-600'} ${isThresholdReached ? 'animate-pulse' : ''}`}>
                  {totalSignatures.toLocaleString()}
                </span>
                <span className="text-2xl text-gray-500">/{threshold.toLocaleString()}</span>
              </div>
              <div className={`w-full bg-gray-200 rounded-full h-3 ${isHighlyPopular ? 'shadow-lg' : ''}`}>
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    isThresholdReached 
                      ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 shadow-lg shadow-orange-500/50 animate-pulse' 
                      : isHighlyPopular 
                        ? 'bg-gradient-to-r from-orange-400 to-red-500 shadow-md shadow-orange-400/30' 
                        : 'bg-gradient-to-r from-orange-400 to-red-500'
                  }`}
                  style={{ width: `${hotMeterPercentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {getSignatureBreakdown()}
              </div>
            </div>

            {/* Goal */}
            {petition.goal && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-700">{t('petition.goal')}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed pl-9">{petition.goal}</p>
              </div>
            )}

            {/* Association */}
            {petition.association_name && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-700">{t('petition.organization')}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed pl-9">
                  {petition.association_name}
                  {petition.association_role && ` (${petition.association_role})`}
                </p>
              </div>
            )}

            {/* Motivation */}
            {petition.motivation && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-700">{t('petition.motivation')}</h2>
                </div>
                <p className="text-gray-600 leading-relaxed pl-9 whitespace-pre-wrap">
                  {petition.motivation}
                </p>
              </div>
            )}

            {/* Footer with Date and Petition Number */}
            <div className="flex items-center justify-between text-gray-500 mt-8 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">{t('petition.filed')} {formatDate(petition.filing_date)}</span>
              </div>
              <span className="text-sm">#{petition.petition_nbr}</span>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PetitionDetailModal;
