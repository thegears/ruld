"use client";

import { useEffect, useState } from "react";
import Waiting from "./waiting";
import { supabase } from "@/lib/supabase/client";
import Debate from "./debate";
import Join from "./join";
import { notFound } from "next/navigation";
import DebateIntro from "./debate-intro";
import { startDebate } from "@/app/actions/room";

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
    status: "debate" | "intro";
    max_rounds: number;
  };
}) {
  const [playerB, setPlayerB] = useState(room.player_b_id);
  const [debatePhase, setDebatePhase] = useState<"debate" | "intro">(
    room.status,
  );
  const [maxRounds, setMaxRounds] = useState<string>(
    room.max_rounds ? `${room.max_rounds}` : "?",
  );

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
  }, [room.id, room.player_b_id]);

  console.log(room);

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
    else return <Debate />;
  }

  // Kullanıcı odanın bir parçası değilse, 404 sayfasını göster
  return notFound();
}
