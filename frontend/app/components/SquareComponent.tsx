import type { Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "./Piece";
import { useDroppable } from "@dnd-kit/core";

export const SquareComponent = ({
  square,
  squarePos,
  onClick,
}: {
  square: { square: Square; type: PieceSymbol; color: Color } | null;
  squarePos: string;
  onClick: () => void;
  isSelected: boolean;
  isValidMove: boolean;
}) => {
  const isDarkSquare = (parseInt(squarePos[1]) + squarePos.charCodeAt(0)) % 2 === 0;
  const squareBg = isDarkSquare ? "bg-slate-500" : "bg-slate-300";
  const { setNodeRef } = useDroppable({ id: squarePos });

  return (
    <div
      className={`w-full h-full aspect-square ${squareBg}`}
      onClick={onClick}
      ref={setNodeRef}
    >
      <div className="w-full h-full flex items-center justify-center">
        {square && <Piece square={square} />}
      </div>
    </div>
  );
};
