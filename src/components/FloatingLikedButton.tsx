
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingLikedButtonProps {
  likedCount: number;
  onClick: () => void;
}

const FloatingLikedButton = ({ likedCount, onClick }: FloatingLikedButtonProps) => {
  if (likedCount === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border-0"
        size="icon"
      >
        <div className="relative">
          <Heart className="w-6 h-6 text-white fill-white" />
          <div className="absolute -top-3 -right-3 bg-white text-pink-500 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md border border-pink-100">
            {likedCount > 99 ? '99+' : likedCount}
          </div>
        </div>
      </Button>
    </div>
  );
};

export default FloatingLikedButton;
