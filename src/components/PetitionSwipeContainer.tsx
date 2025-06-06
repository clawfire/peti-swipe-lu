
import { useState, useEffect } from "react";
import { Petition } from "@/types/petition";
import { usePetitions, useImportPetitions } from "@/hooks/usePetitions";
import { useSwipedPetitions } from "@/hooks/useSwipedPetitions";
import { useTranslation } from "@/hooks/useTranslation";
import SwipeableStack from "@/components/SwipeableStack";
import SwipeInstructions from "@/components/SwipeInstructions";
import FloatingLikedButton from "@/components/FloatingLikedButton";
import ResultsModal from "@/components/ResultsModal";
import LoadingStates from "@/components/LoadingStates";
import EmptyStates from "@/components/EmptyStates";
import ErrorState from "@/components/ErrorState";

const PetitionSwipeContainer = () => {
  const { language } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [allPetitions, setAllPetitions] = useState<Petition[]>([]);
  const [currentPetitions, setCurrentPetitions] = useState<Petition[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);
  const { importFromJson } = useImportPetitions();

  // Use the new swiped petitions hook
  const {
    swipedPetitionIds,
    likedPetitions,
    addSwipedPetition,
    clearSwipedPetitions,
    clearLikedPetitions,
    isLoading: isSwipedDataLoading
  } = useSwipedPetitions();

  const { data: petitionsResponse, isLoading, error, refetch } = usePetitions({
    page: currentPage,
    size: 10,
    language: language.toUpperCase()
  });

  // Filter out already-swiped petitions
  const filterSwipedPetitions = (petitions: Petition[]) => {
    const filtered = petitions.filter(petition => !swipedPetitionIds.has(petition.id));
    console.log(`Filtered ${petitions.length - filtered.length} already-swiped petitions, ${filtered.length} remaining`);
    return filtered;
  };

  // Update petitions when data loads
  useEffect(() => {
    if (petitionsResponse && !isSwipedDataLoading) {
      const newPetitions = petitionsResponse.petitions;
      const filteredNewPetitions = filterSwipedPetitions(newPetitions);
      
      if (currentPage === 0) {
        // First page - replace all petitions
        setAllPetitions(filteredNewPetitions);
        setCurrentPetitions(filteredNewPetitions);
      } else {
        // Subsequent pages - append to existing petitions
        setAllPetitions(prev => [...prev, ...filteredNewPetitions]);
        setCurrentPetitions(prev => [...prev, ...filteredNewPetitions]);
      }
      
      setHasMorePages(petitionsResponse.pagination.hasNext);
      console.log(`Loaded page ${currentPage}, filtered petitions: ${filteredNewPetitions.length}, total: ${allPetitions.length + filteredNewPetitions.length}`);
    }
  }, [petitionsResponse, currentPage, swipedPetitionIds, isSwipedDataLoading]);

  // Reset pagination when language changes (let React Query handle refetching)
  useEffect(() => {
    console.log(`Language changed to: ${language}, resetting pagination`);
    setCurrentPage(0);
    setHasMorePages(true);
    // Don't clear petitions immediately - let React Query handle the refetch
  }, [language]);

  // Re-filter current petitions when swiped data changes
  useEffect(() => {
    if (!isSwipedDataLoading) {
      setCurrentPetitions(prev => filterSwipedPetitions(prev));
    }
  }, [swipedPetitionIds, isSwipedDataLoading]);

  const handleSwipe = (petition: Petition, direction: 'left' | 'right') => {
    console.log(`Swiped ${direction} on petition:`, petition.official_title);
    
    // Mark that user has swiped at least once
    if (!hasSwipedOnce) {
      setHasSwipedOnce(true);
    }
    
    // Add to swiped petitions (this will also handle liked petitions)
    addSwipedPetition(petition, direction);
    
    // Remove the swiped petition from the current list
    setCurrentPetitions(prev => prev.filter(p => p.id !== petition.id));
    
    // If we're running low on petitions and there are more pages, load the next page
    const remainingPetitions = currentPetitions.filter(p => p.id !== petition.id);
    if (remainingPetitions.length <= 2 && hasMorePages && !isLoading) {
      console.log('Running low on petitions, loading next page...');
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleImportFromJson = async () => {
    try {
      await importFromJson();
      // Refresh the data after import
      setCurrentPage(0);
      setAllPetitions([]);
      setCurrentPetitions([]);
      setHasMorePages(true);
      refetch();
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleResetLikedPetitions = () => {
    clearLikedPetitions();
  };

  const handleResetAllSwiped = () => {
    clearSwipedPetitions();
    // Refresh the current view with all petitions
    setCurrentPage(0);
    setAllPetitions([]);
    setCurrentPetitions([]);
    setHasMorePages(true);
    refetch();
  };

  // Improved loading state logic - only show empty state if we have no data AND we're not loading
  const isInitialLoading = (isLoading || isSwipedDataLoading) && currentPetitions.length === 0 && currentPage === 0;
  const isDatabaseEmpty = !isLoading && !isSwipedDataLoading && (!petitionsResponse || petitionsResponse.petitions.length === 0) && currentPage === 0;
  const hasNoPetitionsLeft = !isLoading && !isSwipedDataLoading && currentPetitions.length === 0 && currentPage > 0;

  if (error) {
    return (
      <ErrorState 
        onRetry={() => refetch()}
        onImportFromJson={handleImportFromJson}
      />
    );
  }

  return (
    <>
      <LoadingStates 
        isInitialLoading={isInitialLoading}
        isLoadingMore={isLoading}
        currentPetitionsCount={currentPetitions.length}
      />

      <EmptyStates 
        isDatabaseEmpty={isDatabaseEmpty}
        hasNoPetitionsLeft={hasNoPetitionsLeft}
        likedPetitionsCount={likedPetitions.length}
        onImportFromJson={handleImportFromJson}
        onShowResults={() => setShowResultsModal(true)}
      />

      {!isInitialLoading && !isDatabaseEmpty && !hasNoPetitionsLeft && (
        <>
          {!hasSwipedOnce && <SwipeInstructions />}
          <SwipeableStack petitions={currentPetitions} onSwipe={handleSwipe} />
        </>
      )}

      {/* Floating liked button */}
      <FloatingLikedButton 
        likedCount={likedPetitions.length}
        onClick={() => setShowResultsModal(true)}
      />

      <ResultsModal
        open={showResultsModal}
        onOpenChange={setShowResultsModal}
        likedPetitions={likedPetitions}
        onReset={handleResetLikedPetitions}
        onResetAll={handleResetAllSwiped}
      />
    </>
  );
};

export default PetitionSwipeContainer;
