import React, { useState } from "react";
import SwipeableStack from "@/components/SwipeableStack";
import ResultsModal from "@/components/ResultsModal";
import BundleModal from "@/components/BundleModal";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Heart, X, RotateCcw, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { usePetitions } from "@/hooks/usePetitions";
import { useTranslation } from "@/hooks/useTranslation";
import { Petition } from "@/types/petition";

const Index = () => {
  const { data: allPetitions = [], isLoading, error } = usePetitions();
  const { t } = useTranslation();
  const [likedPetitions, setLikedPetitions] = useState<Petition[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [currentPetitions, setCurrentPetitions] = useState<Petition[]>([]);
  const [swipeCount, setSwipeCount] = useState(0);
  const [bundleLikedPetitions, setBundleLikedPetitions] = useState<Petition[]>([]);

  // Update currentPetitions when data is loaded
  React.useEffect(() => {
    if (allPetitions.length > 0 && currentPetitions.length === 0) {
      setCurrentPetitions(allPetitions.slice(0, 10));
    }
  }, [allPetitions, currentPetitions.length]);

  const handleSwipe = (petition: Petition, direction: 'left' | 'right') => {
    if (direction === 'right') {
      setLikedPetitions(prev => [...prev, petition]);
      setBundleLikedPetitions(prev => [...prev, petition]);
    }
    
    // Remove the swiped petition from current stack
    setCurrentPetitions(prev => prev.filter(p => p.id !== petition.id));
    
    const newSwipeCount = swipeCount + 1;
    setSwipeCount(newSwipeCount);
    
    // Check if we've swiped 10 times or no more petitions in current bundle
    if (newSwipeCount >= 10 || currentPetitions.length === 1) {
      setTimeout(() => setShowBundleModal(true), 500);
    }
  };

  const getNextBundle = () => {
    const startIndex = Math.floor(likedPetitions.length / 10) * 10 + swipeCount;
    const nextBatch = allPetitions.slice(startIndex, startIndex + 10);
    
    if (nextBatch.length > 0) {
      setCurrentPetitions(nextBatch);
      setSwipeCount(0);
      setBundleLikedPetitions([]);
      setShowBundleModal(false);
    } else {
      // If no more petitions, restart from beginning
      setCurrentPetitions(allPetitions.slice(0, 10));
      setSwipeCount(0);
      setBundleLikedPetitions([]);
      setShowBundleModal(false);
    }
  };

  const reviewBundleLiked = () => {
    setShowBundleModal(false);
    setShowResults(true);
  };

  const resetStack = () => {
    setCurrentPetitions(allPetitions.slice(0, 10));
    setLikedPetitions([]);
    setBundleLikedPetitions([]);
    setShowResults(false);
    setShowBundleModal(false);
    setSwipeCount(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">{t('loading.petitions')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('error.loading')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('error.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (allPetitions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{t('error.noPetitions')}</p>
          <p className="text-sm text-gray-500">
            {t('error.importData')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Language selector in top right */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('app.title')}
          </h1>
          <p className="text-gray-600">{t('app.subtitle')}</p>
          <p className="text-sm text-gray-500 mt-2">
            {swipeCount}/10 swipes in this bundle
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-red-500">
                <ArrowLeft className="w-6 h-6" />
                <X className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('instructions.swipeLeft')}</span>
              <span className="text-xs text-gray-500">{t('instructions.toSkip')}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="text-lg font-semibold">{t('instructions.or')}</div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-pink-500">
                <Heart className="w-8 h-8" />
                <ArrowRight className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('instructions.swipeRight')}</span>
              <span className="text-xs text-gray-500">{t('instructions.toSign')}</span>
            </div>
          </div>
        </div>

        {currentPetitions.length > 0 ? (
          <SwipeableStack petitions={currentPetitions} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">{t('completion.title')}</h2>
            <p className="text-gray-600 mb-6">{t('completion.subtitle')}</p>
            <Button onClick={resetStack} className="bg-gradient-to-r from-pink-500 to-purple-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('completion.restart')}
            </Button>
          </div>
        )}

        {likedPetitions.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <Button 
              onClick={() => setShowResults(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-14 h-14 shadow-lg"
              size="icon"
            >
              <Heart className="w-6 h-6" />
            </Button>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {likedPetitions.length}
            </div>
          </div>
        )}

        <BundleModal 
          open={showBundleModal}
          onOpenChange={setShowBundleModal}
          bundleLikedPetitions={bundleLikedPetitions}
          onGetNextBundle={getNextBundle}
          onReviewLiked={reviewBundleLiked}
        />

        <ResultsModal 
          open={showResults}
          onOpenChange={setShowResults}
          likedPetitions={likedPetitions}
          onReset={resetStack}
        />
      </div>
    </div>
  );
};

export default Index;
