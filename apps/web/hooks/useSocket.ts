import { useState, useEffect } from "react";

const useSocket = () => {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8080?token=`);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setLoading(false);
        }
        
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return {
        loading,
        socket,
    }
}

export default useSocket;