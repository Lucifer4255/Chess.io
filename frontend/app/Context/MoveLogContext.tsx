import React, { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface MoveLogEntry{
    move: { from: string; to: string; },
    color: "w" | "b";
}

interface MoveLogContextType {
    moveLog: MoveLogEntry[];
    addMove: (MoveLogEntry : MoveLogEntry) => void;
    resetLog: () => void;
}

const MoveLogContext = createContext<MoveLogContextType | null>(null);

export const MoveLogProvider = ({children} : {children:React.ReactNode}) => {
    const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);
    const addMove = (MoveLogEntry : MoveLogEntry) => {
        const { move, color } = MoveLogEntry;
        setMoveLog((prev) => [...prev, { move, color }]);
        console.log("add move", move);
    }

    const resetLog = () => {
        setMoveLog([]);
        console.log("reset");
    }

    return (
        <MoveLogContext.Provider value={{ moveLog, addMove, resetLog }}>
            {children}
        </MoveLogContext.Provider>
    );
}
export const useMoveLog = () => {
    const context = useContext(MoveLogContext);
    if (!context) throw new Error("useMoveLog must be used within a MoveLogProvider");
    return context;
  };