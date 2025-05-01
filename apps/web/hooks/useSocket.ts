import { useState, useEffect } from "react";

const useSocket = () => {
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
    }, []);

    return {
        loading,
        socket,
    }
}

export default useSocket;