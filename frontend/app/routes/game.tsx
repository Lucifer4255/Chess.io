import { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import ChessBoard from "~/components/ChessBoard";
import { CHAT, GAME_OVER, INIT_GAME, MOVE } from "~/constants/constants";
import { useSocket } from "~/hooks/useSocket";
import { Chess } from "chess.js";
import { MoveLogProvider, useMoveLog } from "~/Context/MoveLogContext";

function GameContent() {
  const socket = useSocket();
  const { moveLog, addMove, resetLog } = useMoveLog();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [playerColor, setPlayerColor] = useState<"w" | "b" | null>(null);
  const [searching, setSearching] = useState(false);
  const [chat, setChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<String[]>([]);
  const [newmessage, setNewMessage] = useState("");
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      switch (data.type) {
        case INIT_GAME:
          setPlayerColor(data.payload.color);
          setBoard(chess.board());
          setStarted(true);
          setSearching(false);
          resetLog();
          console.log("Game initialized", data.payload.color);
          break;
        case MOVE:
          const move = data.payload;
          console.log("Move received", move);
          chess.move(move);
          setBoard(chess.board());
          addMove({ move, color: chess.turn() === 'b' ? 'w' : 'b' });
          break;
        case CHAT:
          console.log("Chat message", data.payload);
          setChatMessages((prev) => [...prev, data.payload]);
          break;
        case GAME_OVER:
          console.log("Game over", data.payload.winner);
          break;
        default:
          break;
      }
    };
  }, [socket, chess,chatMessages]);

  
  if (!socket) return <div>Connecting...</div>;
  const sendMessage = () => {
    if (newmessage.trim() === "") return;
    const data =`${playerColor === "w" ? "White" : "Black"}: ${newmessage}`;
    const messageData = {
      type: CHAT,
      payload: data,
    };
    setChatMessages((prev) => [...prev, data]); // Add chat message to UI
    socket.send(JSON.stringify(messageData)); // ✅ Send chat message to opponent
    setNewMessage(""); // Clear input
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 w-full mt-8">
  <div className="md:col-span-3 w-full flex justify-center">
    <ChessBoard
      chess={chess}
      setBoard={setBoard}
      socket={socket}
      board={board}
      playerColor={playerColor}
    />
  </div>
  <div className="md:col-span-2 w-full flex justify-start">
    <div className="bg-slate-900 rounded-lg p-4 mt-6 md:mt-0 w-[400px] flex flex-col items-center">
      <div className="w-full flex flex-row items-center justify-center">
        <div className={!chat ? `w-full flex flex-col justify-center items-center bg-slate-500 m-2 rounded-lg`:`w-full flex flex-col justify-center items-center hover:bg-slate-700 m-2 rounded-lg`} onClick={() => setChat(!chat)}>
          <h2 className="text-lg font-bold text-white p-2">Move Log</h2>
        </div>
        <div className={chat ? `w-full flex flex-col justify-center items-center bg-slate-500 m-2 rounded-lg`:`w-full flex flex-col justify-center items-center hover:bg-slate-700 m-2 rounded-lg`} onClick={() => started && setChat(!chat)}>
          <h2 className="text-lg font-bold text-white p-2">Chat</h2>
        </div>
      </div>
      {chat && started?
      <>
       <div className="h-[250px] overflow-y-auto bg-gray-800 p-2 rounded-lg w-full">
         {chatMessages.length === 0 ? (
           <p className="text-gray-400">No messages yet</p>
          ) : (
            chatMessages.map((msg, index) => (
              <p key={index} className="text-white">{msg}</p>
            ))
          )}
       </div>
       <div className="flex w-full mt-2 space-x-2">
            <input
              type="text"
              value={newmessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 rounded bg-gray-700 text-white outline-none"
            />
            <Button onClick={sendMessage} disabled={!newmessage.trim()}>
              Send
            </Button>
          </div> 
        </>
      : <div className="h-[600px] overflow-y-auto bg-gray-800 p-2 rounded-lg w-full">
        {moveLog.length === 0 ? (
          <p className="text-gray-400">No moves yet</p>
        ) : (
          moveLog.map((move, index) => (
            <p key={index} className="text-white">
              {`${move.color} - ${move.move.from} -> ${move.move.to}`}
            </p>
          ))
        )}
      </div>}
      <Button
        onClick={() => {
          socket.send(JSON.stringify({ type: INIT_GAME }));
          setSearching(true);
        }}
        disabled={started || searching}
        css="mt-4 w-full"
      >
        {searching ? "Searching for opponent..." : started ? "Game in Progress" : "Play"}
      </Button>
    </div>
  </div>
</div>

  );
}

// ✅ Wrapping GameContent in MoveLogProvider
export default function Game() {
  return (
    <MoveLogProvider>
      <GameContent />
    </MoveLogProvider>
  );
}
