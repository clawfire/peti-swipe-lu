
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { usePetitions } from "@/hooks/usePetitions";
import SwipeableStack from "@/components/SwipeableStack";
import LanguageSelector from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Petition } from "@/types/petition";

const Index = () => {
  const { t, language } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [allPetitions, setAllPetitions] = useState<Petition[]>([]);
  const [currentPetitions, setCurrentPetitions] = useState<Petition[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Convert language code to API format
  const apiLanguage = language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'DE';
  
  const { data: petitionsResponse, isLoading, error, refetch } = usePetitions({
    page: currentPage,
    size: 10,
    language: apiLanguage
  });

  // Update petitions when data loads
  useEffect(() => {
    if (petitionsResponse) {
      const newPetitions = petitionsResponse.petitions;
      
      if (currentPage === 0) {
        // First page - replace all petitions
        setAllPetitions(newPetitions);
        setCurrentPetitions(newPetitions);
      } else {
        // Subsequent pages - append to existing petitions
        setAllPetitions(prev => [...prev, ...newPetitions]);
        setCurrentPetitions(prev => [...prev, ...newPetitions]);
      }
      
      setHasMorePages(petitionsResponse.pagination.hasNext);
      console.log(`Loaded page ${currentPage}, total petitions: ${allPetitions.length + newPetitions.length}`);
    }
  }, [petitionsResponse, currentPage]);

  // Reset when language changes
  useEffect(() => {
    console.log(`Language changed to: ${apiLanguage}, resetting pagination`);
    setCurrentPage(0);
    setAllPetitions([]);
    setCurrentPetitions([]);
    setHasMorePages(true);
  }, [apiLanguage]);

  const handleSwipe = (petition: Petition, direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on petition:`, petition.official_title);
    
    // Remove the swiped petition from the current list
    setCurrentPetitions(prev => prev.filter(p => p.id !== petition.id));
    
    // If we're running low on petitions and there are more pages, load the next page
    const remainingPetitions = currentPetitions.filter(p => p.id !== petition.id);
    if (remainingPetitions.length <= 2 && hasMorePages && !isLoading) {
      console.log('Running low on petitions, loading next page...');
      setCurrentPage(prev => prev + 1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('error.title')}</h2>
            <p className="text-gray-600 mb-6">{t('error.description')}</p>
            <Button onClick={() => refetch()}>
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
            <LanguageSelector />
          </div>
        </div>

        {isLoading && currentPetitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading.petitions')}</p>
          </div>
        ) : !currentPetitions || currentPetitions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noPetitions.title')}</h2>
            <p className="text-gray-600 mb-6">{t('noPetitions.description')}</p>
            <p className="text-sm text-gray-500">
              The petitions are fetched directly from the Luxembourg government API in {apiLanguage}.
            </p>
          </div>
        ) : (
          <>
            <SwipeableStack petitions={currentPetitions} onSwipe={handleSwipe} />
            {isLoading && currentPetitions.length > 0 && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span className="text-sm text-gray-600">Loading more petitions...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
