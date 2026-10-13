import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "../store/useStore";
import { wsUrl } from "./api";

// Keeps one WebSocket open to the backend: updates the live visitor count and
// refreshes project data when the owner publishes something new.
export function useLive() {
  const queryClient = useQueryClient();
  const setOnline = useStore((s) => s.setOnline);
  const pushToast = useStore((s) => s.pushToast);

  useEffect(() => {
    let ws;
    let retry;
    let stopped = false;

    const connect = () => {
      ws = new WebSocket(wsUrl());
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === "presence") setOnline(msg.online);
        if (msg.type === "project_added") {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          pushToast(`New project connected: ${msg.title}`);
        }
      };
      ws.onclose = () => {
        setOnline(0);
        if (!stopped) retry = setTimeout(connect, 3000);
      };
    };

    connect();
    const ping = setInterval(() => ws?.readyState === WebSocket.OPEN && ws.send("ping"), 25000);

    return () => {
      stopped = true;
      clearTimeout(retry);
      clearInterval(ping);
      ws?.close();
    };
  }, [queryClient, setOnline, pushToast]);
}
