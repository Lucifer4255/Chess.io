import { useDraggable } from "@dnd-kit/core";
import type { Color, PieceSymbol, Square } from "chess.js";

export const Piece = ({ square, isDragging = false }: { 
  square: { square: Square; type: PieceSymbol; color: Color }; 
  isDragging?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, isDragging: dragging } = useDraggable({
    id: square.square,
  });

  return (
    <img
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full h-full max-w-[90%] max-h-[90%] object-contain ${
        isDragging || dragging ? "opacity-50 scale-110 transition-transform duration-150" : ""
      }`}
      src={`/${square.color === "b" ? square.type : square.type.toUpperCase()}.png`}
      alt={square.type}
    />
  );
};
