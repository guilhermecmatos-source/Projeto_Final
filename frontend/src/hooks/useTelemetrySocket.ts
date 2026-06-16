import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { TelemetryAlert } from "@/types";

export function useTelemetrySocket(
  isAuthenticated: boolean,
  onAlert: (alert: TelemetryAlert) => void
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    const socketUrl = `http://${host}:3001`;

    console.log(`[socket] Conectando ao servidor WebSocket em ${socketUrl}...`);
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log(`[socket] Conectado ao servidor WebSocket com ID: ${socket.id}`);
    });

    socket.on("telemetry_alert", (alert: TelemetryAlert) => {
      console.log("[socket] Alerta de telemetria recebido:", alert);
      onAlert(alert);
    });

    socket.on("connect_error", (error) => {
      console.warn("[socket] Erro na conexão do WebSocket:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] Desconectado do WebSocket:", reason);
    });

    socketRef.current = socket;

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [isAuthenticated, onAlert]);

  return socketRef.current;
}
