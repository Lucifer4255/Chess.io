import type { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { MOVE } from "~/constants/constants";
import { createPortal } from "react-dom";
import { Piece } from "./Piece";
import { SquareComponent } from "./SquareComponent";
import { useMoveLog } from "~/Context/MoveLogContext";

interface ChessBoardProps {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  chess: Chess;
  setBoard: React.Dispatch<React.SetStateAction<({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][]>>;
  playerColor: "w" | "b" | null;
}

const ChessBoard = ({ board, socket, chess, setBoard, playerColor }: ChessBoardProps) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<{ square: Square; type: PieceSymbol; color: Color } | null>(null);
  const isWhite = playerColor === "w";
  const renderedBoard = isWhite ? board : [...board].reverse();
  const { addMove } = useMoveLog();
  const [isDragging, setIsDragging] = useState(false);  
  const handleSquareClick = (squarePos: Square) => {
    console.log("Clicked square:", squarePos);

    if (chess.turn() !== playerColor) return;

    if (selectedSquare) {
      console.log("Trying to move:", selectedSquare, "to", squarePos);
      const moveResult = chess.move({ from: selectedSquare, to: squarePos, promotion: "q" });

      if (moveResult) {
        console.log("Move successful:", moveResult);
        socket.send(JSON.stringify({ type: MOVE, payload: { move: { from: selectedSquare, to: squarePos } } }));
        setBoard(chess.board());
        addMove({ move: { from: selectedSquare, to: squarePos }, color: playerColor });
      }

      setSelectedSquare(null);
    } else {
      const piece = board.flat().find((sq) => sq?.square === squarePos);
      if (piece && piece.color === playerColor) {
        console.log("Selected piece:", piece);
        setSelectedSquare(squarePos);
      }
    }
  };


  /** Drag-and-Drop Start */
  const onDragStart = (event: DragStartEvent) => {
    const from = event.active.id as Square;
    const piece = chess.get(from);
    if (piece && piece.color === playerColor) {
      setDraggedPiece({ square: from, type: piece.type, color: piece.color });
    }
    setIsDragging(true);
    console.log("Dragging piece:",isDragging);
    // disableScroll();
  };
  
  /** Drag-and-Drop End */
  const onDragEnd = (event: DragEndEvent) => {
    const from = event.active.id as Square;
    const to = event.over?.id as Square;
    
    setDraggedPiece(null);
    // enableScroll();
    setIsDragging(false);
    console.log("Dragging piece:",isDragging);
    // ✅ Prevent invalid moves
    if (!to || from === to || chess.turn() !== playerColor) return;
  
    const moveResult = chess.move({ from, to, promotion: "q" });
  
    if (moveResult) {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: { move: { from, to } },
        })
      );
      setBoard([...chess.board()]);
      addMove({ move: { from, to }, color: playerColor });
    }
  };
  


  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="text-black text-2xl relative"
      style={{ touchAction: "none" }} 
      >
        {renderedBoard.map((row, i) => (
          <div className="flex" key={i}>
            {(isWhite ? row : [...row].reverse()).map((square, j) => {
              const file = String.fromCharCode(97 + (isWhite ? j : 7 - j));
              const rank = isWhite ? 8 - i : i + 1;
              const squarePos = `${file}${rank}` as Square;

              return (
                <SquareComponent
                  key={j}
                  square={square}
                  squarePos={squarePos}
                  onClick={() => handleSquareClick(squarePos)}
                  isSelected={selectedSquare === squarePos}
                  isValidMove={false} // No valid moves shown
                />

              );
            })}
          </div>
        ))}

        {/* Drag Overlay */}
        {createPortal(
          <DragOverlay>
            {draggedPiece ? <Piece square={draggedPiece} isDragging /> : null}
          </DragOverlay>,
          document.body
        )}
      </div>
    </DndContext>
  );
};

export default ChessBoard;
