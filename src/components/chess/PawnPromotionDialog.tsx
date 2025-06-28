import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Castle, Swords } from "lucide-react";

type PieceType = "q" | "r" | "b" | "n";

interface PawnPromotionDialogProps {
  isOpen: boolean;
  playerColor: "white" | "black";
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

export const PawnPromotionDialog = ({
  isOpen,
  playerColor,
  onSelect,
  onCancel,
}: PawnPromotionDialogProps) => {
  const pieces = [
    {
      type: "q" as PieceType,
      name: "Queen",
      icon: Crown,
      symbol: playerColor === "white" ? "♕" : "♛",
      description: "Most powerful piece",
      color: "text-blue-600",
    },
    {
      type: "r" as PieceType,
      name: "Rook",
      icon: Castle,
      symbol: playerColor === "white" ? "♖" : "♜",
      description: "Moves horizontally/vertically",
      color: "text-blue-500",
    },
    {
      type: "b" as PieceType,
      name: "Bishop",
      icon: BishopIcon,
      symbol: playerColor === "white" ? "♗" : "♝",
      description: "Moves diagonally",
      color: "text-blue-700",
    },
    {
      type: "n" as PieceType,
      name: "Knight",
      icon: Swords,
      symbol: playerColor === "white" ? "♘" : "♞",
      description: "Moves in L-shape",
      color: "text-blue-800",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md lavender-glass lavender-shadow border-purple-200/50">
        <DialogHeader>
          <DialogTitle className="text-center text-purple-600 flex items-center justify-center gap-2">
            <Crown className="h-5 w-5" />
            Pawn Promotion
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-center text-gray-600 text-sm">
            Your pawn has reached the end! Choose which piece to promote it to:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {pieces.map((piece) => (
              <Button
                key={piece.type}
                onClick={() => onSelect(piece.type)}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-purple-50 border-purple-200"
              >
                <div className="flex items-center gap-2">
                  <piece.icon className={`h-5 w-5 ${piece.color}`} />
                  <span className="text-2xl">{piece.symbol}</span>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-800">
                    {piece.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {piece.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Most players choose Queen (most powerful)
            </p>
          </div>

          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700"
          >
            Cancel Move
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// BishopIcon component for Bishop representation
const BishopIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
  </svg>
);
