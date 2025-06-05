
export const getEventCoordinates = (e: PointerEvent | React.PointerEvent) => {
  return { clientX: e.clientX, clientY: e.clientY };
};

export const isInteractiveElement = (element: Element | null): boolean => {
  if (!element) return false;
  
  const interactiveSelectors = [
    'button',
    '[role="button"]',
    '[role="dialog"]',
    'a',
    'input',
    'textarea',
    'select',
    '.pointer-events-auto',
    '[data-radix-dialog-content]',
    '[data-radix-dialog-overlay]'
  ];
  
  return interactiveSelectors.some(selector => 
    element.matches?.(selector) || element.closest?.(selector)
  );
};

export const isModalOpen = (): boolean => {
  return document.querySelector('[data-radix-dialog-content]') !== null;
};

export const updateCardTransform = (
  cardRef: React.RefObject<HTMLDivElement>,
  animationRef: React.MutableRefObject<number | undefined>,
  x: number,
  y: number,
  immediate = false
) => {
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
};
