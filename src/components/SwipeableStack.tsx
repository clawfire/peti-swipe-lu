
import { useMemo } from "react";
import PetitionCard from "./PetitionCard";
import { Petition } from "@/types/petition";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface SwipeableStackProps {
  petitions: Petition[];
  onSwipe: (petition: Petition, direction: 'left' | 'right') => void;
}

const SwipeableStack = ({ petitions, onSwipe }: SwipeableStackProps) => {
  // Get the current and next petitions from the array
  const currentPetition = useMemo(() => petitions[0], [petitions]);
  const nextPetition = useMemo(() => petitions[1], [petitions]);

  const { cardRef, handlers } = useSwipeGesture({
    currentPetition,
    onSwipe: (petition, direction) => {
      console.log('SwipeableStack: Triggering swipe animation for petition:', petition.id);
      onSwipe(petition, direction);
    }
  });

  if (!currentPetition) {
    return null;
  }

  return (
    <div className="relative flex justify-center items-center min-h-[600px] max-h-[600px] select-none">
      {/* Next card (background) - only show if it exists */}
      {nextPetition && (
        <div className="absolute transform scale-95 opacity-50 pointer-events-none z-0">
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
