
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "@/components/LanguageSelector";
import PetitionSwipeContainer from "@/components/PetitionSwipeContainer";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {t('app.title')}
            </h1>
            <p className="text-lg text-gray-600">{t('app.subtitle')}</p>
          </div>
          <LanguageSelector />
        </div>

        <PetitionSwipeContainer />
      </div>
    </div>
  );
};

export default Index;
