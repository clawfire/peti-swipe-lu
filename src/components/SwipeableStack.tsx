
import { useState, useRef, useCallback, useLayoutEffect } from "react";
import PetitionCard from "./PetitionCard";
import { Petition } from "@/types/petition";

interface SwipeableStackProps {
  petitions: Petition[];
  onSwipe: (petition: Petition, direction: 'left' | 'right') => void;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  velocity: number;
  lastTimestamp: number;
}

const SwipeableStack = ({ petitions, onSwipe }: SwipeableStackProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    velocity: 0,
    lastTimestamp: 0
  });
  
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const cachedRect = useRef<DOMRect | null>(null);

  const currentPetition = petitions[currentIndex];
  const nextPetition = petitions[currentIndex + 1];

  if (!currentPetition) {
    return null;
  }

  // Cache bounding rect on mount and resize
  useLayoutEffect(() => {
    const updateRect = () => {
      if (cardRef.current) {
        cachedRect.current = cardRef.current.getBoundingClientRect();
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentIndex]);

  const getEventCoordinates = (e: PointerEvent | React.PointerEvent) => {
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const isInteractiveElement = (element: Element | null): boolean => {
    if (!element) return false;
    
    const interactiveSelectors = [
      'button',
      '[role="button"]',
      'a',
      'input',
      'textarea',
      'select',
      '.pointer-events-auto'
    ];
    
    return interactiveSelectors.some(selector => 
      element.matches?.(selector) || element.closest?.(selector)
    );
  };

  const updateCardTransform = useCallback((x: number, y: number, immediate = false) => {
    if (!cardRef.current) return;

    const rotation = x * 0.1;
    const transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    
    if (immediate) {
      cardRef.current.style.transform = transform;
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      animationRef.current = requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = transform;
        }
      });
    }

    // Update overlay with optimized thresholds
    const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
    if (overlay) {
      const absX = Math.abs(x);
      if (absX > 30) {
        const opacity = Math.min(absX / 120, 0.8);
        const color = x > 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)';
        overlay.style.background = `linear-gradient(45deg, ${color}, ${color.replace('0.8', '0.4')})`;
        overlay.style.opacity = opacity.toString();
      } else {
        overlay.style.opacity = '0';
      }
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Check if the pointer started on an interactive element
    if (isInteractiveElement(e.target as Element)) {
      console.log('Pointer down on interactive element, ignoring swipe');
      return;
    }

    e.preventDefault();
    
    if (!cardRef.current || !cachedRect.current) return;

    const { clientX, clientY } = getEventCoordinates(e);
    const rect = cachedRect.current;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    console.log('Starting swipe gesture');
    setDragState({
      isDragging: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX - centerX,
      currentY: clientY - centerY,
      velocity: 0,
      lastTimestamp: Date.now()
    });

    // Set pointer capture for smooth tracking
    cardRef.current.setPointerCapture(e.pointerId);
    
    // Add will-change for optimization
    cardRef.current.style.willChange = 'transform';
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging || !cachedRect.current) return;

    e.preventDefault();
    
    const { clientX, clientY } = getEventCoordinates(e);
    const rect = cachedRect.current;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentTime = Date.now();
    const deltaTime = currentTime - dragState.lastTimestamp;
    const deltaX = clientX - dragState.startX;
    const deltaY = clientY - dragState.startY;
    
    // Calculate velocity for momentum
    const velocity = deltaTime > 0 ? deltaX / deltaTime : 0;
    
    setDragState(prev => ({
      ...prev,
      currentX: deltaX,
      currentY: deltaY,
      velocity,
      lastTimestamp: currentTime
    }));

    updateCardTransform(deltaX, deltaY);
  }, [dragState.isDragging, dragState.lastTimestamp, dragState.startX, dragState.startY, updateCardTransform]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging || !cardRef.current) return;

    e.preventDefault();
    
    const absX = Math.abs(dragState.currentX);
    const threshold = 100;
    const velocityThreshold = 0.5;
    
    // Check if swipe should trigger based on distance or velocity
    const shouldSwipe = absX > threshold || Math.abs(dragState.velocity) > velocityThreshold;
    
    console.log('Ending swipe gesture, shouldSwipe:', shouldSwipe);
    setDragState(prev => ({ ...prev, isDragging: false }));
    
    // Release pointer capture
    cardRef.current.releasePointerCapture(e.pointerId);
    
    if (shouldSwipe) {
      const direction = dragState.currentX > 0 ? 'right' : 'left';
      const exitDistance = direction === 'right' ? window.innerWidth : -window.innerWidth;
      
      console.log('Swiping card', direction);
      
      // Animate card off screen with momentum
      cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease-out';
      cardRef.current.style.transform = `translate3d(${exitDistance}px, ${dragState.currentY - 50}px, 0) rotate(${dragState.currentX * 0.2}deg)`;
      cardRef.current.style.opacity = '0';
      
      setTimeout(() => {
        onSwipe(currentPetition, direction);
        setCurrentIndex(prev => prev + 1);
        
        if (cardRef.current) {
          // Reset all styles
          cardRef.current.style.transition = '';
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '';
          cardRef.current.style.willChange = '';
          
          const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
          if (overlay) overlay.style.opacity = '0';
        }
      }, 300);
    } else {
      // Snap back to center with spring animation
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      cardRef.current.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
      cardRef.current.style.willChange = '';
      
      const overlay = cardRef.current.querySelector('.swipe-overlay') as HTMLElement;
      if (overlay) overlay.style.opacity = '0';
      
      setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transition = '';
        }
      }, 400);
    }
  }, [dragState, currentPetition, onSwipe]);

  // Cleanup animation frame on unmount
  useLayoutEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="swipe-overlay absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-200 opacity-0 z-10"></div>
        <PetitionCard petition={currentPetition} />
      </div>
    </div>
  );
};

export default SwipeableStack;
