
import { Users, Flame } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardSignaturesProps {
  signElectronic?: number | null;
  signPaper?: number | null;
  status: string;
  filingDate: string;
}

const PetitionCardSignatures = ({ signElectronic, signPaper, status, filingDate }: PetitionCardSignaturesProps) => {
  const { t } = useTranslation();
  const totalSignatures = (signElectronic || 0) + (signPaper || 0);
  
  // Historical threshold logic: petitions filed before March 1, 2025 use 4500 threshold
  const getThreshold = () => {
    try {
      const filing = new Date(filingDate);
      const marchFirst2025 = new Date('2025-03-01');
      return filing < marchFirst2025 ? 4500 : 5500;
    } catch {
      return 5500; // Default to current threshold if date parsing fails
    }
  };

  const threshold = getThreshold();
  const hotMeterPercentage = Math.min((totalSignatures / threshold) * 100, 100);
  const isThresholdReached = status === 'SEUIL_ATTEINT';
  const isHighlyPopular = hotMeterPercentage > 80 || isThresholdReached;

  return (
    <div className="mb-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isThresholdReached ? (
            <Flame className={`w-4 h-4 text-yellow-500 animate-pulse`} />
          ) : (
            <Users className="w-4 h-4 text-green-600" />
          )}
          <span className="text-sm font-medium text-gray-700">{t('petition.signatures')}</span>
          {isThresholdReached && (
            <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold animate-pulse">
              {t('petition.popular')}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className={`text-2xl font-bold ${isThresholdReached ? 'text-orange-600' : 'text-green-600'} ${isThresholdReached ? 'animate-pulse' : ''}`}>
          {totalSignatures.toLocaleString()}
        </span>
        <span className="text-sm text-gray-500">/{threshold.toLocaleString()}</span>
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

      <div className="text-xs text-gray-500 mt-1">
        {signElectronic && signElectronic > 0 && `${signElectronic.toLocaleString()} ${t('petition.electronic')}`}
        {signElectronic && signElectronic > 0 && signPaper && signPaper > 0 && ' • '}
        {signPaper && signPaper > 0 && `${signPaper.toLocaleString()} ${t('petition.paper')}`}
      </div>
    </div>
  );
};

export default PetitionCardSignatures;
