
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

interface EmptyStatesProps {
  isDatabaseEmpty: boolean;
  hasNoPetitionsLeft: boolean;
  likedPetitionsCount: number;
  onImportFromJson: () => void;
  onShowResults: () => void;
}

const EmptyStates = ({ 
  isDatabaseEmpty, 
  hasNoPetitionsLeft, 
  likedPetitionsCount,
  onImportFromJson,
  onShowResults
}: EmptyStatesProps) => {
  const { t } = useTranslation();

  if (isDatabaseEmpty) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noPetitions.title')}</h2>
        <p className="text-gray-600 mb-6">{t('noPetitions.description')}</p>
        <p className="text-sm text-gray-500 mb-4">
          Petitions are now stored locally in the database. You can import new data from a JSON file.
        </p>
        <Button onClick={onImportFromJson}>
          Import Petitions from JSON
        </Button>
      </div>
    );
  }

  if (hasNoPetitionsLeft) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('noPetitions.title')}</h2>
        <p className="text-gray-600 mb-6">{t('noPetitions.description')}</p>
        {likedPetitionsCount > 0 ? (
          <div className="space-y-4">
            <Button onClick={onShowResults}>
              View {likedPetitionsCount} Liked Petition{likedPetitionsCount > 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={onImportFromJson}>
              Import More Petitions from JSON
            </Button>
          </div>
        ) : (
          <Button onClick={onImportFromJson}>
            Import Petitions from JSON
          </Button>
        )}
      </div>
    );
  }

  return null;
};

export default EmptyStates;
