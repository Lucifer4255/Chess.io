import { useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { Button } from "~/components/Button";
import { MoveLogProvider } from "~/Context/MoveLogContext";
// import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chess.io" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  let navigate = useNavigate();
  return (
    <MoveLogProvider>

  <div className="mt-5 flex flex-col items-center">
    <div className="text-center mt-6">
      <h1 className="text-6xl font-bold">Chess.io</h1>
      <p className="text-lg">Welcome to Chess.io</p>
    </div>
    <div className="grid grid-cols-1 gap-20 md:grid-cols-2 mt-8">
      <div className="flex justify-center">
        <img src={"/image.png"} alt="chessboard" className="max-w-120 rounded"/>
      </div>
      <div className="flex flex-col justify-center">
        <h1 className="text-4xl font-bold">Play Chess</h1>
        <p>Play chess with your friends or with a random opponent.</p>
        <div className="mt-4">
        <Button disabled={false} onClick={() => navigate("/game")}>Play Online</Button>
        </div>
      </div>
    </div>
      
  </div>
  </MoveLogProvider>
  );
}
