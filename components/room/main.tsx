"use client";

import { useEffect, useState } from "react";
import Waiting from "./waiting";
import { supabase } from "@/lib/supabase/client";
import Debate from "./debate";
import Join from "./join";
import { notFound } from "next/navigation";
import DebateIntro from "./debate-intro";
import { startDebate } from "@/app/actions/room";
import Verdict from "./verdict";

export type Message = {
  id?: string;
  room_id?: string;
  side: "A" | "B" | "AI";
  content: string;
  turn_number?: number;
  created_at?: string;
  target: string;
};

export default function Main({
  userId,
  url,
  room,
}: {
  userId: string | undefined;
  url: string;
  room: {
    id: string;
    player_a_id: string;
    player_a_name: string;
    player_b_id: string | null;
    player_b_name: string | null;
    topic: string;
    status: "debate" | "intro" | "verdict";
    max_rounds: number;
    messages: Message[];
    current_turn: "A" | "B";
  };
}) {
  const [playerB, setPlayerB] = useState(room.player_b_id);
  const [debatePhase, setDebatePhase] = useState<
    "debate" | "intro" | "verdict"
  >(
    room.status === "verdict"
      ? "verdict"
      : room.status != "debate"
        ? "intro"
        : room.status,
  );
  const [maxRounds, setMaxRounds] = useState<string>(
    room.max_rounds ? `${room.max_rounds}` : "?",
  );

  // Oyuncu B ve maxRounds listener
  useEffect(() => {
    if (room.player_b_id) return;
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new.player_b_id) {
            setPlayerB(payload.new.player_b_id);
            setDebatePhase("intro");
          }
          if (payload.new.max_rounds) {
            setMaxRounds(payload.new.max_rounds);
            supabase.removeChannel(channel);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Oyuncu B henüz katılmamışsa ve kullanıcı A ise, bekleme ekranını göster
  if (!playerB && userId == room.player_a_id) return <Waiting url={url} />;

  // Oyuncu B henüz katılmamışsa ve kullanıcı A değilse, katılma ekranını göster
  if (!playerB && userId != room.player_a_id)
    return (
      <Join
        playerAName={room.player_a_name}
        userId={userId as string}
        roomId={room.id}
        topic={room.topic}
        setPlayerB={(id) => setPlayerB(id)}
        setMaxRounds={(maxRounds) => setMaxRounds(`${maxRounds}`)}
      />
    );

  // Her iki oyuncu da katıldıysa, tartışma ekranını göster
  if (playerB && [room.player_a_id, playerB].includes(userId!)) {
    if (debatePhase == "intro")
      return (
        <DebateIntro
          onFinish={() => {
            setDebatePhase("debate");
            startDebate(room.id);
          }}
          roundCount={maxRounds!}
        />
      );
    else if (debatePhase == "debate")
      return (
        <Debate
          topic={room.topic}
          playerSide={userId === room.player_a_id ? "A" : "B"}
          maxRounds={maxRounds}
          InitialMessages={room.messages}
          roomId={room.id}
          currentTurn={room.current_turn}
          setPageToVerdict={() => setDebatePhase("verdict")}
        />
      );
    else if (debatePhase == "verdict") return <Verdict roomId={room.id} />;
    else notFound();
  }

  // Kullanıcı odanın bir parçası değilse, 404 sayfasını göster
  return notFound();
}
