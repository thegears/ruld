import { getRoom } from "@/app/actions/room";
import Waiting from "@/components/room/waiting";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await getRoom(id);
  const locale = await getLocale();

  if (room.error) return notFound();
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/room/${id}`;

  if (!room.data.player_b_id) return <Waiting url={url} />;

  return <>selam</>;
}
