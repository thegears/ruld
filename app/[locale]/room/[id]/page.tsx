"use server";

import { getRoom } from "@/app/actions/room";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Main from "@/components/room/main";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const room = await getRoom(id);
  const locale = await getLocale();

  if (room.error) return notFound();

  const cookieStore = await cookies();
  const userId = cookieStore.get("ruld_user_id")?.value;

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/room/${id}`;

  return <Main userId={userId} url={url} room={room.data} />;
}
