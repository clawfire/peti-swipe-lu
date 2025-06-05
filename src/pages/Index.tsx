
import React, { useState } from "react";
import SwipeableStack from "@/components/SwipeableStack";
import ResultsModal from "@/components/ResultsModal";
import { Button } from "@/components/ui/button";
import { Heart, X, RotateCcw, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { usePetitions } from "@/hooks/usePetitions";
import { Petition } from "@/types/petition";

const Index = () => {
  const { data: allPetitions = [], isLoading, error } = usePetitions();
  const [likedPetitions, setLikedPetitions] = useState<Petition[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPetitions, setCurrentPetitions] = useState<Petition[]>([]);

  // Update currentPetitions when data is loaded
  React.useEffect(() => {
    if (allPetitions.length > 0 && currentPetitions.length === 0) {
      setCurrentPetitions(allPetitions);
    }
  }, [allPetitions, currentPetitions.length]);

  const handleSwipe = (petition: Petition, direction: 'left' | 'right') => {
    if (direction === 'right') {
      setLikedPetitions(prev => [...prev, petition]);
    }
    
    // Remove the swiped petition from current stack
    setCurrentPetitions(prev => prev.filter(p => p.id !== petition.id));
    
    // If no more petitions, show results
    if (currentPetitions.length === 1) {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const resetStack = () => {
    setCurrentPetitions(allPetitions);
    setLikedPetitions([]);
    setShowResults(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Chargement des pétitions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des pétitions</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (allPetitions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Aucune pétition trouvée</p>
          <p className="text-sm text-gray-500">
            Importez vos données de pétitions dans Supabase pour commencer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            PetitionSwipe
          </h1>
          <p className="text-gray-600">Découvrez et soutenez les pétitions qui vous tiennent à cœur</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-red-500">
                <ArrowLeft className="w-6 h-6" />
                <X className="w-8 h-8" />
              </div>
              <span className="text-sm font-medium text-gray-700">Glissez à gauche</span>
              <span className="text-xs text-gray-500">pour passer</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="text-lg font-semibold">OU</div>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-pink-500">
                <Heart className="w-8 h-8" />
                <ArrowRight className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-700">Glissez à droite</span>
              <span className="text-xs text-gray-500">pour signer</span>
            </div>
          </div>
        </div>

        {currentPetitions.length > 0 ? (
          <SwipeableStack petitions={currentPetitions} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Toutes les pétitions parcourues!</h2>
            <p className="text-gray-600 mb-6">Vous avez vu toutes les pétitions disponibles</p>
            <Button onClick={resetStack} className="bg-gradient-to-r from-pink-500 to-purple-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
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
