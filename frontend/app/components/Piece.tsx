import { useDraggable } from "@dnd-kit/core";
import type { Color, PieceSymbol, Square } from "chess.js";

export const Piece = ({ square, isDragging = false}: { 
    square: { square: Square; type: PieceSymbol; color: Color }; 
    isDragging?: boolean; }) => {
    const { attributes, listeners, setNodeRef, isDragging: dragging } = useDraggable({
      id: square.square,
    });
  
    return (
      <img
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`lg:w-16 md:w-14 sm:w-12 cursor-grab ${
          isDragging || dragging ? "opacity-50 scale-125 transition-transform duration-150" : ""
        }`}
        src={`/${square.color === "b" ? square.type : square.type.toUpperCase()}.png`}
        alt={square.type}
      />
    );
  };
  