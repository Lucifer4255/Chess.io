import { useDroppable } from "@dnd-kit/core";
import type { Color, PieceSymbol, Square } from "chess.js";
import { Piece } from "./Piece";

export const SquareComponent = ({
  square,
  squarePos,
}: {
  square: { square: Square; type: PieceSymbol; color: Color } | null;
  squarePos: Square;
}) => {
  const { setNodeRef } = useDroppable({ id: squarePos });

  return (
    <div
      ref={setNodeRef}
      className={`lg:w-24 md:w-16 sm:w-12 aspect-square ${(parseInt(squarePos[1]) + squarePos.charCodeAt(0)) % 2 === 0 ? "bg-slate-500" : "bg-slate-300"}`}
    >
      <div className="w-full h-full flex items-center justify-center">
        {square && <Piece square={square}/>}
      </div>
    </div>
  );
};
