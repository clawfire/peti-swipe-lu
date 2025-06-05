
import { useState, useRef } from "react";
import PetitionCard from "./PetitionCard";
import { Petition } from "@/types/petition";

interface SwipeableStackProps {
  petitions: Petition[];
  onSwipe: (petition: Petition, direction: 'left' | 'right') => void;
}

const SwipeableStack = ({ petitions, onSwipe }: SwipeableStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentPetition = petitions[currentIndex];
  const nextPetition = petitions[currentIndex + 1];

  if (!currentPetition) {
    return null;
  }

  const getEventCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const { clientX, clientY } = getEventCoordinates(e);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const startX = clientX - rect.left - rect.width / 2;
      const startY = clientY - rect.top - rect.height / 2;
      setDragOffset({ x: startX, y: startY });
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const { clientX, clientY } = getEventCoordinates(e);
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2 - dragOffset.x;
    const y = clientY - rect.top - rect.height / 2 - dragOffset.y;
    
    cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${x * 0.1}deg)`;
    
    // Add color overlay based on swipe direction
    const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
    if (overlay) {
      if (x > 50) {
        overlay.style.background = 'linear-gradient(45deg, rgba(34, 197, 94, 0.8), rgba(34, 197, 94, 0.4))';
        overlay.style.opacity = Math.min(Math.abs(x) / 100, 0.8).toString();
      } else if (x < -50) {
        overlay.style.background = 'linear-gradient(45deg, rgba(239, 68, 68, 0.8), rgba(239, 68, 68, 0.4))';
        overlay.style.opacity = Math.min(Math.abs(x) / 100, 0.8).toString();
      } else {
        overlay.style.opacity = '0';
      }
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !cardRef.current) return;
    
    const { clientX } = getEventCoordinates(e);
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2 - dragOffset.x;
    
    setIsDragging(false);
    
    if (Math.abs(x) > 100) {
      // Swipe detected
      const direction = x > 0 ? 'right' : 'left';
      
      // Animate card off screen
      cardRef.current.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      cardRef.current.style.transform = `translate(${direction === 'right' ? '100vw' : '-100vw'}, ${-50}px) rotate(${x * 0.2}deg)`;
      cardRef.current.style.opacity = '0';
      
      setTimeout(() => {
        onSwipe(currentPetition, direction);
        setCurrentIndex(prev => prev + 1);
        if (cardRef.current) {
          cardRef.current.style.transition = '';
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '';
          const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '0';
        }
      }, 300);
    } else {
      // Snap back to center
      cardRef.current.style.transition = 'transform 0.2s ease-out';
      cardRef.current.style.transform = '';
      const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
      if (overlay) overlay.style.opacity = '0';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 200);
    }
  };

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
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div className="swipe-overlay absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 opacity-0 z-10"></div>
        <PetitionCard petition={currentPetition} />
      </div>
    </div>
  );
};

export default SwipeableStack;
