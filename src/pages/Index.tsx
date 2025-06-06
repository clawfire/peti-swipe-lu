
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSelector from "@/components/LanguageSelector";
import PetitionSwipeContainer from "@/components/PetitionSwipeContainer";

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header with centered title and language selector */}
        <div className="flex justify-center items-center mb-4 relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {t('app.title')}
          </h1>
          {/* Language selector positioned absolutely to the right */}
          <div className="absolute right-0">
            <LanguageSelector />
          </div>
        </div>

        {/* Subtitle with more spacing */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">{t('app.subtitle')}</p>
        </div>

        <PetitionSwipeContainer />
      </div>
    </div>
  );
};

export default Index;
