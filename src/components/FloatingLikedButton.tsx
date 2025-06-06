import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
interface FloatingLikedButtonProps {
  likedCount: number;
  onClick: () => void;
}
const FloatingLikedButton = ({
  likedCount,
  onClick
}: FloatingLikedButtonProps) => {
  if (likedCount === 0) return null;
  return <div className="fixed bottom-6 right-6 z-50">
      <Button onClick={onClick} className="w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110" size="icon">
        <div className="relative">
          <Heart className="w-6 h-6 text-white fill-white" />
          <div className="absolute -top-5 -right-5 bg-white text-pink-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {likedCount}
          </div>
        </div>
      </Button>
    </div>;
};
export default FloatingLikedButton;