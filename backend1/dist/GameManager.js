"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const constants_1 = require("./constants");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            console.log("Received message", message);
            if (message.type === constants_1.INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (message.type === constants_1.MOVE) {
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    console.log("Received move from player", message.payload.move);
                    game.makeMove(socket, message.payload.move);
                }
                else {
                    console.error("Game not found for player", socket);
                }
            }
            if (message.type === constants_1.CHAT) {
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if (game) {
                    const recipient = (game.player1 === socket ? game.player2 : game.player1);
                    console.log("Forwarding message to recipient", message.payload);
                    recipient.send(JSON.stringify({
                        type: constants_1.CHAT,
                        payload: message.payload
                    }));
                }
                else {
                    console.error("Game not found for player", socket);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
