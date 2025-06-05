
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { usePetitions } from "@/hooks/usePetitions";
import SwipeableStack from "@/components/SwipeableStack";
import LanguageSelector from "@/components/LanguageSelector";
import SecurityAlert from "@/components/SecurityAlert";
import SecurityMonitor from "@/components/SecurityMonitor";
import PetitionSync from "@/components/PetitionSync";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3 } from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const { data: petitions, isLoading, error } = usePetitions();
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('error.title')}</h2>
            <p className="text-gray-600 mb-6">{t('error.description')}</p>
            <Button onClick={() => window.location.reload()}>
              {t('error.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('app.title')}</h1>
            <p className="text-lg text-gray-600">{t('app.subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSecurityMonitor(!showSecurityMonitor)}
              className="flex items-center gap-2"
            >
              {showSecurityMonitor ? <BarChart3 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {showSecurityMonitor ? 'Hide Monitor' : 'Security'}
            </Button>
            <LanguageSelector />
          </div>
        </div>

        <SecurityAlert />
        <PetitionSync />
        
        {showSecurityMonitor && (
          <div className="mb-6">
            <SecurityMonitor />
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading.petitions')}</p>
          </div>
        ) : !petitions || petitions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noPetitions.title')}</h2>
            <p className="text-gray-600 mb-6">{t('noPetitions.description')}</p>
            <p className="text-sm text-gray-500">
              Use the "Sync Now" button above to fetch the latest petitions from the Luxembourg government API.
            </p>
          </div>
        ) : (
          <SwipeableStack petitions={petitions} />
        )}
      </div>
    </div>
  );
};

export default Index;
