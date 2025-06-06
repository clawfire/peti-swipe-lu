
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  onRetry: () => void;
  onImportFromJson: () => void;
}

const ErrorState = ({ onRetry, onImportFromJson }: ErrorStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="container mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('error.title')}</h2>
          <p className="text-gray-600 mb-6">{t('error.description')}</p>
          <div className="space-x-4">
            <Button onClick={onRetry}>
              {t('error.retry')}
            </Button>
            <Button variant="outline" onClick={onImportFromJson}>
              Import from JSON
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
