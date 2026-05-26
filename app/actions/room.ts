"use server";

import z from "zod";
import { supabase } from "@/lib/supabase/client";
import { redirect } from "@/lib/i18n/routing";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";
import { getAIResponse, getAIVerdict, getRoundCount } from "./ai";

const createRoomSchema = z.object({
  topic: z.string().min(1, "topicIsRequired"),
  name: z.string().min(1, "nameIsRequired"),
});

const joinRoomSchema = z.object({
  name: z.string().min(1, "nameIsRequired"),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, "contentIsRequired"),
  side: z.enum(["A", "B"]),
  roomId: z.string().uuid(),
});

export async function createRoom(_: unknown, formData: FormData) {
  const topic = formData.get("topic") as string;
  const name = formData.get("name") as string;

  const parsed = createRoomSchema.safeParse({ topic, name });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const cookieStore = await cookies();
  const userId = cookieStore.get("ruld_user_id")?.value;

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
    .select("*, messages(*)")
    .eq("id", roomId)
    .single();

  if (error) return { error: "failedToGetRoom" };

  return { data };
}

export async function joinRoom(_: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const userId = formData.get("userId") as string;
  const roomId = formData.get("roomId") as string;
  const topic = formData.get("topic") as string;

  const parsed = joinRoomSchema.safeParse({ name });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const maxRounds = await getRoundCount(topic);

  const { error } = await supabase
    .from("rooms")
    .update({
      player_b_id: userId,
      player_b_name: name,
      status: "intro",
      max_rounds: maxRounds,
    })
    .eq("id", roomId)
    .select()
    .maybeSingle();

  if (error) {
    return { error: "failedToJoinRoom" };
  }

  return { success: true, maxRounds };
}

export async function startDebate(roomId: string) {
  await supabase
    .from("rooms")
    .update({ status: "debate" })
    .eq("id", roomId)
    .select()
    .maybeSingle();
}

export async function sendMessage(_: unknown, formData: FormData) {
  const content = formData.get("content") as string;
  const side = formData.get("side") as string;
  const roomId = formData.get("roomId") as string;
  const topic = formData.get("topic") as string;

  const parsed = sendMessageSchema.safeParse({ content, side, roomId });

  if (!parsed.success) return { error: parsed.error.errors[0].message };

  await supabase.from("messages").insert({ content, side, room_id: roomId });

  const aiResponse = await getAIResponse({ topic, content, roomId });

  await supabase.from("messages").insert({
    content: aiResponse,
    side: "AI",
    room_id: roomId,
    target: side == "A" ? "B" : "A",
  });

  await supabase
    .from("rooms")
    .update({
      current_turn: side == "A" ? "B" : "A",
    })
    .eq("id", roomId);

  return { success: true };
}

export async function verdict(roomId: string) {
  const { reasoning } = await getAIVerdict(roomId);

  const { error } = await supabase.from("verdicts").insert({
    room_id: roomId,
    reasoning,
  });

  await supabase.from("rooms").update({ status: "verdict" }).eq("id", roomId);

  return { success: true };
}

export async function getVerdict(roomId: string) {
  const { data } = await supabase
    .from("verdicts")
    .select("*")
    .eq("room_id", roomId)
    .single();

  return { data };
}
