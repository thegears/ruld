"use client";

import { useEffect, useState } from "react";
import Waiting from "./waiting";
import { supabase } from "@/lib/supabase/client";
import Debate from "./debate";
import Join from "./join";
import { notFound } from "next/navigation";

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
  };
}) {
  const [playerB, setPlayerB] = useState(room.player_b_id);

  useEffect(() => {
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
            supabase.removeChannel(channel);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

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
        setPlayerB={setPlayerB}
      />
    );

  // Her iki oyuncu da katıldıysa, tartışma ekranını göster
  if (playerB && [room.player_a_id, playerB].includes(userId!))
    return <Debate />;

  // Kullanıcı odanın bir parçası değilse, 404 sayfasını göster
  return notFound();
}
