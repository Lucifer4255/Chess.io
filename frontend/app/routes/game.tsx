import { useEffect, useState, useMemo } from "react";
import { Button } from "~/components/Button";
import ChessBoard from "~/components/ChessBoard";
import { CHAT, GAME_OVER, INIT_GAME, MOVE } from "~/constants/constants";
import { useSocket } from "~/hooks/useSocket";
import { Chess } from "chess.js";
import { MoveLogProvider, useMoveLog } from "~/Context/MoveLogContext";

function GameContent() {
  const socket = useSocket();
  const { moveLog, addMove, resetLog } = useMoveLog();
  const chess = useMemo(() => new Chess(), []); // ✅ Optimized: Memoized chess instance
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
          break;
        case MOVE:
          const move = data.payload;
          chess.move(move);
          setBoard(chess.board());
          addMove({ move, color: chess.turn() === "b" ? "w" : "b" });
          break;
        case CHAT:
          setChatMessages((prev) => [...prev, data.payload]);
          break;
        case GAME_OVER:
          console.log("Game over", data.payload.winner);
          break;
        default:
          break;
      }
    };
  }, [socket, chess]);

  if (!socket) return <div>Connecting...</div>;

  const sendMessage = () => {
    if (newmessage.trim() === "") return;
    const data = `${playerColor === "w" ? "White" : "Black"}: ${newmessage}`;
    const messageData = { type: CHAT, payload: data };
    setChatMessages((prev) => [...prev, data]); // Add message locally
    socket.send(JSON.stringify(messageData)); // Send message to opponent
    setNewMessage(""); // Clear input
  };

  return (
    <div className="flex flex-col md:flex-row justify-center items-center w-full h-screen p-4">
      {/* Chessboard Container */}
      <div className="flex justify-center items-center w-full m-4 md:w-[60%] lg:w-[65%] xl:w-[70%] max-w-[800px] max-h-[90vh] aspect-square">
        <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} playerColor={playerColor} />
      </div>

      {/* Move Log & Chat */}
      <div className="flex flex-col w-full md:w-[35%] lg:w-[30%] xl:w-[25%] h-[80vh] max-h-[90vh] bg-gray-900 rounded-lg p-4 overflow-hidden">
        {/* Move Log / Chat Tabs */}
        <div className="flex justify-between">
          <button className={`w-1/2 py-2 text-white ${!chat ? "bg-slate-500" : "hover:bg-slate-700"}`} onClick={() => setChat(false)}>Move Log</button>
          <button className={`w-1/2 py-2 text-white ${chat ? "bg-slate-500" : "hover:bg-slate-700"}`} onClick={() => started && setChat(true)}>Chat</button>
        </div>

        {/* Move Log or Chat */}
        <div className="flex flex-col flex-1 overflow-y-auto bg-gray-800 p-2 rounded-lg mt-2">
          <div className="flex-1 overflow-y-auto">
            {chat && started ? (
              chatMessages.length === 0 ? (
                <p className="text-gray-400">No messages yet</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <p key={index} className="text-white">{msg}</p>
                ))
              )
            ) : moveLog.length === 0 ? (
              <p className="text-gray-400">No moves yet</p>
            ) : (
              moveLog.map((move, index) => (
                <p key={index} className="text-white">
                  {`${move.color} - ${move.move.from} -> ${move.move.to}`}
                </p>
              ))
            )}
          </div>

          {/* Chat Input Box */}
          {chat && started && (
            <div className="flex mt-2">
              <input
                type="text"
                value={newmessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 bg-gray-700 text-white rounded-l-lg focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 px-4 py-2 text-white rounded-r-lg hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          )}
        </div>


        {/* Play Button */}
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



  );


}

export default function Game() {
  return (
    <MoveLogProvider>
      <GameContent />
    </MoveLogProvider>
  );
}
