import { getRoom } from "@/app/actions/room";
import Waiting from "@/components/room/waiting";
import { notFound } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await getRoom(id);

  if (room.error) return notFound();

  if (!room.data.player_b_id) return <Waiting />;

  return <>selam</>;
}
