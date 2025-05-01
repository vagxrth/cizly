import { useEffect, useState } from "react";
import axios from "axios";
import RoomClient from "./RoomClient";

const getMessages = async (roomId: string) => {
  const res = await axios.get(`http://localhost:3001/chats/${roomId}`);
  return res.data.messages;
}

const ChatRoom = async (roomId: string) => {
  const messages = await getMessages(roomId);
  return <div>
    <RoomClient roomId={roomId} />
  </div>;
};

export default ChatRoom;
