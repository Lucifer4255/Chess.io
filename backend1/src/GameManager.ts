import { WebSocket } from "ws";
import { CHAT, INIT_GAME, MOVE } from "./constants";
import { Game } from "./Game";

export class GameManager{
    private games:Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor(){
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket : WebSocket){
        this.users.push(socket);
        this.addHandler(socket);
    }

    removeUser(socket:WebSocket){
        this.users = this.users.filter(user => user !== socket);
    }

    private addHandler(socket:WebSocket){
        socket.on("message" , (data) => {
            const message = JSON.parse(data.toString());
            console.log("Received message", message);
            if(message.type === INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else{
                    this.pendingUser = socket;
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if(game){
                    console.log("Received move from player",message.payload.move);
                    game.makeMove(socket,message.payload.move);
                }
                else{
                    console.error("Game not found for player", socket);
                }
            }

            if(message.type === CHAT){
                const game = this.games.find(g => g.player1 === socket || g.player2 === socket);
                if(game){
                    const recipient = (game.player1 === socket ? game.player2 : game.player1);
                    console.log("Forwarding message to recipient",message.payload);
                    recipient.send(JSON.stringify({
                        type: CHAT,
                        payload: message.payload
                    }));
                }
                else{
                    console.error("Game not found for player", socket);
                }
            }
        })

    }

}