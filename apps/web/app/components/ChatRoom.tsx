import { useEffect, useState } from "react";
import axios from "axios";

const getMessages = async (roomId: string) => {
  const res = await axios.get(`http://localhost:3001/chats/${roomId}`);
  return res.data.messages;
}

const ChatRoom = async (roomId: string) => {
  const messages = await getMessages(roomId);
  return <div>ChatRoom</div>;
};

export default ChatRoom;
