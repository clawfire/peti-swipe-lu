
import { useState } from "react";
import SwipeableStack from "@/components/SwipeableStack";
import ResultsModal from "@/components/ResultsModal";
import { Button } from "@/components/ui/button";
import { Heart, X, RotateCcw } from "lucide-react";

// Mock petition data following the schema
const mockPetitions = [
  {
    PETITION_NBR: 1234,
    FILING_DATE: "2024-01-15",
    OFFICIAL_TITLE: "Pour une meilleure protection de l'environnement urbain",
    TYPE: "PUB",
    STATUS: "SIGNATURE_EN_COURS",
    ASSOCIATION_ROLE: "Président",
    ASSOCIATION_NAME: "EcoLux",
    RESIDENCY_COUNTRY: "Luxembourg",
    GOAL: "Création de plus d'espaces verts dans la ville et réduction de la pollution",
    SIGN_NBR_ELECTRONIC: 2340,
    SIGN_NBR_PAPER: 156,
    MOTIVATION: "Face à l'urbanisation croissante et aux défis climatiques, il est urgent d'agir pour préserver notre environnement urbain. Cette pétition vise à sensibiliser et mobiliser pour des actions concrètes."
  },
  {
    PETITION_NBR: 1235,
    FILING_DATE: "2024-02-20",
    OFFICIAL_TITLE: "Amélioration des transports publics",
    TYPE: "PUB",
    STATUS: "SIGNATURE_EN_COURS",
    ASSOCIATION_ROLE: null,
    ASSOCIATION_NAME: null,
    RESIDENCY_COUNTRY: "Luxembourg",
    GOAL: "Développer un réseau de transport plus efficace et accessible",
    SIGN_NBR_ELECTRONIC: 4200,
    SIGN_NBR_PAPER: 89,
    MOTIVATION: "Les transports publics actuels ne répondent pas aux besoins de la population grandissante. Il faut investir dans des solutions durables et modernes."
  },
  {
    PETITION_NBR: 1236,
    FILING_DATE: "2024-03-10",
    OFFICIAL_TITLE: "Soutien aux petites entreprises locales",
    TYPE: "PUB",
    STATUS: "SIGNATURE_EN_COURS",
    ASSOCIATION_ROLE: "Directeur",
    ASSOCIATION_NAME: "Commerce Local Uni",
    RESIDENCY_COUNTRY: "Luxembourg",
    GOAL: "Créer des mesures de soutien fiscal pour les petites entreprises",
    SIGN_NBR_ELECTRONIC: 1800,
    SIGN_NBR_PAPER: 245,
    MOTIVATION: "Les petites entreprises sont le cœur de notre économie locale. Elles ont besoin de soutien pour survivre face à la concurrence des grandes chaînes."
  },
  {
    PETITION_NBR: 1237,
    FILING_DATE: "2024-04-05",
    OFFICIAL_TITLE: "Renforcement de la sécurité dans les écoles",
    TYPE: "PUB",
    STATUS: "SIGNATURE_EN_COURS",
    ASSOCIATION_ROLE: null,
    ASSOCIATION_NAME: null,
    RESIDENCY_COUNTRY: "Luxembourg",
    GOAL: "Mettre en place des mesures de sécurité renforcées dans tous les établissements scolaires",
    SIGN_NBR_ELECTRONIC: 3650,
    SIGN_NBR_PAPER: 312,
    MOTIVATION: "La sécurité de nos enfants est primordiale. Il est nécessaire d'investir dans des équipements et formations pour garantir un environnement scolaire sûr."
  },
  {
    PETITION_NBR: 1238,
    FILING_DATE: "2024-05-15",
    OFFICIAL_TITLE: "Digitalisation des services administratifs",
    TYPE: "PUB",
    STATUS: "SIGNATURE_EN_COURS",
    ASSOCIATION_ROLE: "Secrétaire",
    ASSOCIATION_NAME: "CitoyensConnectés",
    RESIDENCY_COUNTRY: "Luxembourg",
    GOAL: "Accélérer la transformation numérique de l'administration publique",
    SIGN_NBR_ELECTRONIC: 892,
    SIGN_NBR_PAPER: 45,
    MOTIVATION: "L'administration doit se moderniser pour offrir des services plus rapides et accessibles aux citoyens. La digitalisation est un enjeu majeur pour l'efficacité publique."
  }
];

const Index = () => {
  const [likedPetitions, setLikedPetitions] = useState<typeof mockPetitions>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentPetitions, setCurrentPetitions] = useState(mockPetitions);

  const handleSwipe = (petition: typeof mockPetitions[0], direction: 'left' | 'right') => {
    if (direction === 'right') {
      setLikedPetitions(prev => [...prev, petition]);
    }
    
    // Remove the swiped petition from current stack
    setCurrentPetitions(prev => prev.filter(p => p.PETITION_NBR !== petition.PETITION_NBR));
    
    // If no more petitions, show results
    if (currentPetitions.length === 1) {
      setTimeout(() => setShowResults(true), 500);
    }
  };

  const resetStack = () => {
    setCurrentPetitions(mockPetitions);
    setLikedPetitions([]);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            PetitionSwipe
          </h1>
          <p className="text-gray-600">Découvrez et soutenez les pétitions qui vous tiennent à cœur</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Passer</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span className="text-sm text-gray-600">Signer</span>
            </div>
          </div>
        </div>

        {currentPetitions.length > 0 ? (
          <SwipeableStack petitions={currentPetitions} onSwipe={handleSwipe} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Toutes les pétitions parcourues!</h2>
            <p className="text-gray-600 mb-6">Vous avez vu toutes les pétitions disponibles</p>
            <Button onClick={resetStack} className="bg-gradient-to-r from-pink-500 to-purple-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Recommencer
            </Button>
          </div>
        )}

        {likedPetitions.length > 0 && (
          <div className="fixed bottom-6 right-6">
            <Button 
              onClick={() => setShowResults(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-14 h-14 shadow-lg"
              size="icon"
            >
              <Heart className="w-6 h-6" />
            </Button>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {likedPetitions.length}
            </div>
          </div>
        )}

        <ResultsModal 
          open={showResults}
          onOpenChange={setShowResults}
          likedPetitions={likedPetitions}
          onReset={resetStack}
        />
      </div>
    </div>
  );
};

export default Index;
