import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./constants";

export class Game {
  public player1: WebSocket;
  public player2: WebSocket;
  public board: Chess;
  private startTime: Date;
  constructor(player1: WebSocket, player2: WebSocket) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();

    // Send appropriate color assignment, etc.
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "w" },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { color: "b" },
      })
    );
  }

  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    const currentTurn = this.board.turn();
    if ((currentTurn === "w" && socket !== this.player1) || (currentTurn === "b" && socket !== this.player2)) {
      console.log("Move attempted by wrong player:", move);
      return;
    }
    const moveResult = this.board.move({ ...move, promotion: "q" });
    if (!moveResult) {
      console.log("Illegal move attempted", move);
      return;
    }
    if (this.board.isGameOver()) {
      const winner = this.board.turn() === "w" ? "black" : "white";
      this.player1.send(JSON.stringify({ type: GAME_OVER, payload: { winner } }));
      this.player2.send(JSON.stringify({ type: GAME_OVER, payload: { winner } }));
      return;
    }
    // Send the move to the opposing player.
    if (currentTurn === "w") {
      this.player2.send(JSON.stringify({ type: MOVE, payload: move }));
    } else {
      this.player1.send(JSON.stringify({ type: MOVE, payload: move }));
    }
  }
}