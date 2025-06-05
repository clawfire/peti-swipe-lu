
import { Calendar, Users, Flame, Building2, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Petition {
  PETITION_NBR: number;
  FILING_DATE: string;
  OFFICIAL_TITLE: string;
  TYPE: string;
  STATUS: string;
  ASSOCIATION_ROLE?: string | null;
  ASSOCIATION_NAME?: string | null;
  RESIDENCY_COUNTRY: string;
  GOAL?: string | null;
  SIGN_NBR_ELECTRONIC?: number | null;
  SIGN_NBR_PAPER?: number | null;
  MOTIVATION?: string | null;
}

interface PetitionCardProps {
  petition: Petition;
}

const PetitionCard = ({ petition }: PetitionCardProps) => {
  const totalSignatures = (petition.SIGN_NBR_ELECTRONIC || 0) + (petition.SIGN_NBR_PAPER || 0);
  const hotMeterPercentage = Math.min((totalSignatures / 5500) * 100, 100);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SIGNATURE_EN_COURS':
        return 'bg-green-100 text-green-800';
      case 'SEUIL_ATTEINT':
        return 'bg-blue-100 text-blue-800';
      case 'CLOTUREE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SIGNATURE_EN_COURS':
        return 'En cours de signature';
      case 'SEUIL_ATTEINT':
        return 'Seuil atteint';
      case 'CLOTUREE':
        return 'Clôturée';
      case 'RECEVABLE':
        return 'Recevable';
      default:
        return status;
    }
  };

  return (
    <Card className="w-80 h-[550px] bg-white shadow-xl rounded-2xl overflow-hidden">
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <Badge className={getStatusColor(petition.STATUS)}>
            {getStatusText(petition.STATUS)}
          </Badge>
          <span className="text-sm text-gray-500">#{petition.PETITION_NBR}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 line-clamp-3">
          {petition.OFFICIAL_TITLE}
        </h2>

        {/* Goal */}
        {petition.GOAL && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Objectif</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{petition.GOAL}</p>
          </div>
        )}

        {/* Association */}
        {petition.ASSOCIATION_NAME && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Organisation</span>
            </div>
            <p className="text-sm text-gray-600">
              {petition.ASSOCIATION_NAME}
              {petition.ASSOCIATION_ROLE && ` (${petition.ASSOCIATION_ROLE})`}
            </p>
          </div>
        )}

        {/* Motivation */}
        {petition.MOTIVATION && (
          <div className="mb-4 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">Motivation</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-4">{petition.MOTIVATION}</p>
          </div>
        )}

        {/* Hot Meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Popularité</span>
            </div>
            <span className="text-sm text-gray-600">{totalSignatures}/5500</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${hotMeterPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Signatures</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{totalSignatures.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {petition.SIGN_NBR_ELECTRONIC && `${petition.SIGN_NBR_ELECTRONIC} électroniques`}
            {petition.SIGN_NBR_ELECTRONIC && petition.SIGN_NBR_PAPER && ' • '}
            {petition.SIGN_NBR_PAPER && `${petition.SIGN_NBR_PAPER} papier`}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Déposée {formatDate(petition.FILING_DATE)}</span>
        </div>
      </div>
    </Card>
  );
};

export default PetitionCard;
