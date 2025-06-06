
import { useTranslation } from "@/hooks/useTranslation";

interface LoadingStatesProps {
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  currentPetitionsCount: number;
}

const LoadingStates = ({ isInitialLoading, isLoadingMore, currentPetitionsCount }: LoadingStatesProps) => {
  const { t } = useTranslation();

  if (isInitialLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loading.petitions')}</p>
      </div>
    );
  }

  if (isLoadingMore && currentPetitionsCount > 0) {
    return (
      <div className="text-center mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          <span className="text-sm text-gray-600">Loading more petitions...</span>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingStates;
