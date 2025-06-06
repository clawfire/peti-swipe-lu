
import { useTranslation } from "@/hooks/useTranslation";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SwipeInstructions = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center mb-6 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-gray-200">
        <div className="flex items-center gap-6 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-100 rounded-full">
              <ArrowLeft className="w-4 h-4 text-red-500" />
            </div>
            <span>{t('instructions.swipeLeft')} {t('instructions.toSkip')}</span>
          </div>
          
          <div className="text-gray-400 font-medium">{t('instructions.or')}</div>
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-green-100 rounded-full">
              <ArrowRight className="w-4 h-4 text-green-500" />
            </div>
            <span>{t('instructions.swipeRight')} {t('instructions.toSign')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwipeInstructions;
