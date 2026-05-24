"use server";

import z from "zod";
import { supabase } from "@/lib/supabase/client";
import { redirect } from "@/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

const createRoomSchema = z.object({
  topic: z.string().min(1, "topicIsRequired"),
  name: z.string().min(1, "nameIsRequired"),
});

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  let userId = cookieStore.get("ruld_user_id")?.value;

  if (!userId) {
    userId = crypto.randomUUID();
    cookieStore.set("ruld_user_id", userId, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return userId;
}

export async function createRoom(prevState: unknown, formData: FormData) {
  const topic = formData.get("topic") as string;
  const name = formData.get("name") as string;

  const parsed = createRoomSchema.safeParse({ topic, name });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const userId = await getUserIdFromCookie();

  const { data, error } = await supabase
    .from("rooms")
    .insert({ topic, player_a_name: name, player_a_id: userId })
    .select()
    .single();

  if (error) {
    return { error: "failedToCreateRoom" };
  }

  const locale = await getLocale();

  return redirect({
    href: `/room/${data.id}`,
    locale,
  });
}

export async function getRoom(roomId: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select()
    .eq("id", roomId)
    .single();

  if (error) return { error: "failedToGetRoom" };
  return { data };
}
