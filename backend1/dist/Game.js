"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const constants_1 = require("./constants");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        // Send appropriate color assignment, etc.
        this.player1.send(JSON.stringify({
            type: constants_1.INIT_GAME,
            payload: { color: "w" },
        }));
        this.player2.send(JSON.stringify({
            type: constants_1.INIT_GAME,
            payload: { color: "b" },
        }));
    }
    makeMove(socket, move) {
        const currentTurn = this.board.turn();
        if ((currentTurn === "w" && socket !== this.player1) || (currentTurn === "b" && socket !== this.player2)) {
            console.log("Move attempted by wrong player:", move);
            return;
        }
        const moveResult = this.board.move(Object.assign(Object.assign({}, move), { promotion: "q" }));
        if (!moveResult) {
            console.log("Illegal move attempted", move);
            return;
        }
        if (this.board.isGameOver()) {
            const winner = this.board.turn() === "w" ? "black" : "white";
            this.player1.send(JSON.stringify({ type: constants_1.GAME_OVER, payload: { winner } }));
            this.player2.send(JSON.stringify({ type: constants_1.GAME_OVER, payload: { winner } }));
            return;
        }
        // Send the move to the opposing player.
        if (currentTurn === "w") {
            this.player2.send(JSON.stringify({ type: constants_1.MOVE, payload: move }));
        }
        else {
            this.player1.send(JSON.stringify({ type: constants_1.MOVE, payload: move }));
        }
    }
}
exports.Game = Game;
