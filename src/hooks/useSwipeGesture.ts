
import { useState, useRef, useCallback, useLayoutEffect } from "react";
import { DragState, SwipeGestureHandlers } from "@/types/swipe";
import { getEventCoordinates, isInteractiveElement, isModalOpen, updateCardTransform } from "@/utils/swipeUtils";
import { Petition } from "@/types/petition";

interface UseSwipeGestureProps {
  currentPetition: Petition;
  onSwipe: (petition: Petition, direction: 'left' | 'right') => void;
}

export const useSwipeGesture = ({ currentPetition, onSwipe }: UseSwipeGestureProps) => {
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

  // Cache bounding rect on mount and when petition changes
  useLayoutEffect(() => {
    const updateRect = () => {
      if (cardRef.current) {
        cachedRect.current = cardRef.current.getBoundingClientRect();
      }
    };

    // Update immediately and add resize listener
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [currentPetition?.id]);

  // Cleanup animation frame on unmount
  useLayoutEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Don't start swipe if modal is open
    if (isModalOpen()) {
      return;
    }

    // Check if the pointer started on an interactive element
    if (isInteractiveElement(e.target as Element)) {
      console.log('Pointer down on interactive element, ignoring swipe');
      return;
    }

    e.preventDefault();
    
    if (!cardRef.current) return;

    // Update cached rect before starting drag
    cachedRect.current = cardRef.current.getBoundingClientRect();
    
    if (!cachedRect.current) return;

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
    if (!dragState.isDragging || !cachedRect.current || isModalOpen()) return;

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

    updateCardTransform(cardRef, animationRef, deltaX, deltaY);
  }, [dragState.isDragging, dragState.lastTimestamp, dragState.startX, dragState.startY]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.isDragging || !cardRef.current || isModalOpen()) return;

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
      
      // Call onSwipe after the animation completes - this will update the petitions array
      setTimeout(() => {
        onSwipe(currentPetition, direction);
        
        // Reset card styles for the next card
        if (cardRef.current) {
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

  const handlers: SwipeGestureHandlers = {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };

  return {
    cardRef,
    handlers,
    dragState
  };
};
