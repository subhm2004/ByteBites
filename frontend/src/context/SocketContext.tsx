import { useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAppData } from "./useAppData";
import { SocketContext } from "./socketContext";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAppData();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    const newSocket = io("http://localhost:5004", {
      auth: { token: localStorage.getItem("token") },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  );
};
