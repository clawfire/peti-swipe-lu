
import { useState, useEffect } from "react";
import { usePetitions } from "@/hooks/usePetitions";
import { useToast } from "@/hooks/use-toast";
import { Petition } from "@/types/petition";
import SwipeableStack from "@/components/SwipeableStack";
import ResultsModal from "@/components/ResultsModal";
import LanguageSelector from "@/components/LanguageSelector";
import SecurityMonitor from "@/components/SecurityMonitor";
import SecurityAlert from "@/components/SecurityAlert";
import { useTranslation } from "@/hooks/useTranslation";

const Index = () => {
  const { data: petitions = [], isLoading, error } = usePetitions();
  const [currentPetitions, setCurrentPetitions] = useState<Petition[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [swipeResults, setSwipeResults] = useState<{[key: string]: 'left' | 'right'}>({});
  const [showSecurityMonitor, setShowSecurityMonitor] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Initialize petitions when data is loaded
  useEffect(() => {
    if (petitions.length > 0 && currentPetitions.length === 0) {
      console.log('Initializing petitions:', petitions.length);
      setCurrentPetitions([...petitions]);
    }
  }, [petitions, currentPetitions.length]);

  const handleSwipe = (petition: Petition, direction: 'left' | 'right') => {
    console.log('Index: Handling swipe', petition.id, direction);
    
    // Record the swipe result
    setSwipeResults(prev => ({
      ...prev,
      [petition.id]: direction
    }));

    // Remove the current petition and show the next one
    setCurrentPetitions(prev => {
      const newPetitions = prev.filter(p => p.id !== petition.id);
      console.log('Remaining petitions:', newPetitions.length);
      
      if (newPetitions.length === 0) {
        console.log('No more petitions, showing results');
        setShowResults(true);
      }
      
      return newPetitions;
    });

    // Show feedback toast
    const message = direction === 'right' ? t('swipe.supported') : t('swipe.notSupported');
    toast({
      title: message,
      description: petition.official_title,
      duration: 2000,
    });
  };

  const handleRestart = () => {
    console.log('Restarting with fresh petitions');
    setCurrentPetitions([...petitions]);
    setSwipeResults({});
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading.petitions')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('error.title')}</h2>
          <p className="text-gray-600 mb-4">{t('error.description')}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('error.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (petitions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('noPetitions.title')}</h2>
          <p className="text-gray-600">{t('noPetitions.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
              <button
                onClick={() => setShowSecurityMonitor(!showSecurityMonitor)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {showSecurityMonitor ? 'Hide' : 'Show'} Security Monitor
              </button>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Security Alert */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SecurityAlert />
      </div>

      {/* Security Monitor */}
      {showSecurityMonitor && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <SecurityMonitor />
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('app.subtitle')}
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('app.description')}
          </p>
          
          {/* Instructions */}
          <div className="bg-white rounded-xl p-6 mb-8 shadow-lg max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-4">{t('instructions.title')}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>{t('instructions.swipeRight')}</span>
                <span className="text-green-600">👍</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('instructions.swipeLeft')}</span>
                <span className="text-red-600">👎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Swipeable Stack */}
        <SwipeableStack 
          petitions={currentPetitions} 
          onSwipe={handleSwipe}
        />

        {/* Results Modal */}
        <ResultsModal
          open={showResults}
          onOpenChange={setShowResults}
          results={swipeResults}
          petitions={petitions}
          onRestart={handleRestart}
        />
      </main>
    </div>
  );
};

export default Index;
