import axios from "axios";

const getRoom = async (slug: string) => {
  const res = await axios.get(`http://localhost:3001/rooms/${slug}`);
  return res.data.id;
}

const Room = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;
  const roomId = await getRoom(slug);
  return <div>Room {slug}</div>;
};

export default Room;