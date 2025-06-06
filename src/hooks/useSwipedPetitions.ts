
import { useState, useEffect, useCallback } from 'react';
import { Petition } from '@/types/petition';

const STORAGE_KEY = 'swipedPetitions';
const LIKED_STORAGE_KEY = 'likedPetitions';

interface SwipedPetitionData {
  id: string;
  direction: 'left' | 'right';
  timestamp: number;
  petitionData?: Petition; // Store full petition data for liked ones
}

interface UseSwipedPetitionsReturn {
  swipedPetitionIds: Set<string>;
  likedPetitions: Petition[];
  addSwipedPetition: (petition: Petition, direction: 'left' | 'right') => void;
  clearSwipedPetitions: () => void;
  clearLikedPetitions: () => void;
  isLoading: boolean;
}

export const useSwipedPetitions = (): UseSwipedPetitionsReturn => {
  const [swipedPetitionIds, setSwipedPetitionIds] = useState<Set<string>>(new Set());
  const [likedPetitions, setLikedPetitions] = useState<Petition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Load swiped petition IDs
      const storedSwiped = localStorage.getItem(STORAGE_KEY);
      if (storedSwiped) {
        const swipedData: SwipedPetitionData[] = JSON.parse(storedSwiped);
        const ids = new Set(swipedData.map(item => item.id));
        setSwipedPetitionIds(ids);
        console.log(`Loaded ${ids.size} swiped petition IDs from localStorage`);
      }

      // Load liked petitions
      const storedLiked = localStorage.getItem(LIKED_STORAGE_KEY);
      if (storedLiked) {
        const likedData: Petition[] = JSON.parse(storedLiked);
        setLikedPetitions(likedData);
        console.log(`Loaded ${likedData.length} liked petitions from localStorage`);
      }
    } catch (error) {
      console.error('Error loading swiped petitions from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save swiped petitions to localStorage
  const saveSwipedToStorage = useCallback((swipedData: SwipedPetitionData[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(swipedData));
    } catch (error) {
      console.error('Error saving swiped petitions to localStorage:', error);
    }
  }, []);

  // Save liked petitions to localStorage
  const saveLikedToStorage = useCallback((liked: Petition[]) => {
    try {
      localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify(liked));
    } catch (error) {
      console.error('Error saving liked petitions to localStorage:', error);
    }
  }, []);

  const addSwipedPetition = useCallback((petition: Petition, direction: 'left' | 'right') => {
    const swipeData: SwipedPetitionData = {
      id: petition.id,
      direction,
      timestamp: Date.now(),
      petitionData: direction === 'right' ? petition : undefined
    };

    // Update swiped IDs
    setSwipedPetitionIds(prev => {
      const newSet = new Set(prev);
      newSet.add(petition.id);
      return newSet;
    });

    // Update liked petitions if swiped right
    if (direction === 'right') {
      setLikedPetitions(prev => {
        // Check if petition is already liked to avoid duplicates
        if (prev.find(p => p.id === petition.id)) {
          return prev;
        }
        const newLiked = [...prev, petition];
        saveLikedToStorage(newLiked);
        return newLiked;
      });
    }

    // Save to localStorage
    try {
      const storedSwiped = localStorage.getItem(STORAGE_KEY);
      const existingData: SwipedPetitionData[] = storedSwiped ? JSON.parse(storedSwiped) : [];
      
      // Remove any existing entry for this petition and add the new one
      const filteredData = existingData.filter(item => item.id !== petition.id);
      const newData = [...filteredData, swipeData];
      
      saveSwipedToStorage(newData);
      console.log(`Saved swipe ${direction} for petition ${petition.id} to localStorage`);
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
  }, [saveSwipedToStorage, saveLikedToStorage]);

  const clearSwipedPetitions = useCallback(() => {
    setSwipedPetitionIds(new Set());
    setLikedPetitions([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LIKED_STORAGE_KEY);
    console.log('Cleared all swiped petitions from localStorage');
  }, []);

  const clearLikedPetitions = useCallback(() => {
    setLikedPetitions([]);
    saveLikedToStorage([]);
    console.log('Cleared liked petitions from localStorage');
  }, [saveLikedToStorage]);

  return {
    swipedPetitionIds,
    likedPetitions,
    addSwipedPetition,
    clearSwipedPetitions,
    clearLikedPetitions,
    isLoading
  };
};
