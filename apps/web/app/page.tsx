'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
const Home = () => {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  return <div>
    <input value={roomId} onChange={(e) => setRoomId(e.target.value)} type="text" placeholder="Room ID" />
    <input type="text" placeholder="Message" />
    <button onClick={() => router.push(`/room/${roomId}`)}>Send</button>
  </div>;
};

export default Home;
