import { useDroppable } from "@dnd-kit/core";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "./Piece";

interface SquareProps {
  square: { square: Square; type: PieceSymbol; color: Color } | null;
  squarePos: Square;
}

export const SquareComponent = ({ square, squarePos }: SquareProps) => {
  const { setNodeRef } = useDroppable({ id: squarePos });

  const isDarkSquare = (parseInt(squarePos[1]) + squarePos.charCodeAt(0)) % 2 === 0;
  const squareBg = isDarkSquare ? "bg-slate-600" : "bg-slate-300";

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full aspect-square ${squareBg} flex justify-center items-center`}
    >
      {square && <Piece square={square} />}
    </div>
  );
};
