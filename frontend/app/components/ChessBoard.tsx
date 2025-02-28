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
  // const [validMoves, setValidMoves] = useState<Square[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<{ square: Square; type: PieceSymbol; color: Color } | null>(null);
  const isWhite = playerColor === "w";
  const renderedBoard = isWhite ? board : [...board].reverse();
  const {moveLog,addMove,resetLog} = useMoveLog();

  const onDragStart = (event: DragStartEvent) => {
    const from = event.active.id as Square;
    const piece = board.flat().find((sq) => sq?.square === from);
    if (piece) setDraggedPiece(piece);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const from = event.active.id as Square;
    const to = event.over?.id as Square;

    setDraggedPiece(null);
    if (!to || chess.turn() !== playerColor) return;

    const moveResult = chess.move({ from, to, promotion: "q" });
    if (moveResult) {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: { move: { from, to } },
        })
      );
      setBoard(chess.board());
      addMove({ move: { from, to }, color: playerColor });
    }

  };

  return (
    <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="text-black text-2xl relative">
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
