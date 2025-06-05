
import { useState, useLayoutEffect } from "react";
import PetitionCard from "./PetitionCard";
import { Petition } from "@/types/petition";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface SwipeableStackProps {
  petitions: Petition[];
  onSwipe: (petition: Petition, direction: 'left' | 'right') => void;
}

const SwipeableStack = ({ petitions, onSwipe }: SwipeableStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentPetition = petitions[currentIndex];
  const nextPetition = petitions[currentIndex + 1];

  const { cardRef, handlers } = useSwipeGesture({
    currentPetition,
    onSwipe,
    onNext: () => setCurrentIndex(prev => prev + 1)
  });

  if (!currentPetition) {
    return null;
  }

  // Update cached rect when currentIndex changes
  useLayoutEffect(() => {
    // Force rect recalculation when the current petition changes
    if (cardRef.current) {
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.getBoundingClientRect();
        }
      }, 0);
    }
  }, [currentIndex, cardRef]);

  return (
    <div className="relative flex justify-center items-center h-[600px] select-none">
      {/* Next card (background) */}
      {nextPetition && (
        <div className="absolute transform scale-95 opacity-50 pointer-events-none">
          <PetitionCard petition={nextPetition} />
        </div>
      )}
      
      {/* Current card */}
      <div
        ref={cardRef}
        className="relative cursor-grab active:cursor-grabbing z-10 touch-none"
        style={{ 
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onPointerDown={handlers.handlePointerDown}
        onPointerMove={handlers.handlePointerMove}
        onPointerUp={handlers.handlePointerUp}
        onPointerCancel={handlers.handlePointerUp}
      >
        <div className="swipe-overlay absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 opacity-0 z-10"></div>
        <PetitionCard petition={currentPetition} />
      </div>
    </div>
  );
};

export default SwipeableStack;
