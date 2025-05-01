'use client'

import useSocket from "../../hooks/useSocket";
import { useEffect, useState } from "react";

const RoomClient = ({ roomId }: { roomId: string }) => {
    const {socket, loading} = useSocket();
    const [chats, setChats] = useState<string[]>([]);
    const [currentMessage, setCurrentMessage] = useState<string>("");

    useEffect(() => {
        if (socket && !loading) {

            socket.send(JSON.stringify({
                type: "join_room",
                roomId: roomId,
            }));

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "message") {
                    setChats(prev => [...prev, data.message]);
                }
            }
        }
    }, [socket, loading, roomId]);

    return <div>
        <div>
            {chats.map((chat) => (
                <div key={chat}>{chat}</div>
            ))}
        </div>
        <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} />
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: "send_message",
                message: currentMessage,
            }));
            setCurrentMessage("");
        }}>Send</button>
    </div>;
};

export default RoomClient;