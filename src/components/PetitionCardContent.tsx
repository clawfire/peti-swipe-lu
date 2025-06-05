
import { Building2, Target, MessageSquare, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

interface PetitionCardContentProps {
  goal?: string | null;
  associationName?: string | null;
  associationRole?: string | null;
  motivation?: string | null;
  onShowMore: (e: React.MouseEvent) => void;
}

const PetitionCardContent = ({ 
  goal, 
  associationName, 
  associationRole, 
  motivation, 
  onShowMore 
}: PetitionCardContentProps) => {
  const { t } = useTranslation();

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 pr-2">
      {/* Goal */}
      {goal && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{t('petition.goal')}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{goal}</p>
        </div>
      )}

      {/* Association */}
      {associationName && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{t('petition.organization')}</span>
          </div>
          <p className="text-sm text-gray-600">
            {associationName}
            {associationRole && ` (${associationRole})`}
          </p>
        </div>
      )}

      {/* Motivation with show more functionality */}
      {motivation && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{t('petition.motivation')}</span>
          </div>
          <div className="relative">
            <p className="text-sm text-gray-600 line-clamp-3">
              {motivation}
            </p>
            {motivation.length > 150 && (
              <div className="mt-2" onPointerDown={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShowMore}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onPointerMove={(e) => e.stopPropagation()}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800 pointer-events-auto relative z-20"
                >
                  <ChevronDown className="w-4 h-4 mr-1" />
                  {t('petition.showMore')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetitionCardContent;
