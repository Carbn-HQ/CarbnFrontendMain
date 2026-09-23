const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://carbnbackend.onrender.com/api/v1";

export const connectRealtime = ({
  role,
  token,
  onEvent,
}: {
  role: "admin" | "user";
  token: string;
  onEvent: (event: string, payload: Record<string, unknown>) => void;
}) => {
  let closed = false;
  let socket: WebSocket | null = null;
  let timer: number | undefined;
  let attempt = 0;

  const connect = () => {
    if (closed || !token) {
      return;
    }

    const url = new URL(`${API_BASE.replace(/^http/, "ws")}/ws`);
    url.searchParams.set("role", role);
    url.searchParams.set("token", token);
    socket = new WebSocket(url.toString());

    socket.onopen = () => {
      attempt = 0;
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(String(message.data)) as {
          event?: string;
          payload?: Record<string, unknown>;
        };
        if (data?.event) {
          onEvent(data.event, data.payload || {});
        }
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = () => {
      if (closed) {
        return;
      }
      attempt += 1;
      timer = window.setTimeout(connect, Math.min(10000, 1000 * attempt));
    };
  };

  connect();

  return () => {
    closed = true;
    if (timer) {
      window.clearTimeout(timer);
    }
    socket?.close();
  };
};
