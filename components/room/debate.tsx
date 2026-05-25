import { Circle, CircleCheck, Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import { type Message } from "./main";
import { supabase } from "@/lib/supabase/client";
import { sendMessage } from "@/app/actions/room";

export default function Debate({
  topic,
  playerSide,
  maxRounds,
  InitialMessages,
  roomId,
  currentTurn,
}: {
  topic: string;
  playerSide: "A" | "B";
  maxRounds: string;
  InitialMessages: Message[];
  roomId: string;
  currentTurn: "A" | "B";
}) {
  const t = useTranslations("debate");

  const [playerTurn, setPlayerTurn] = useState<"A" | "B">(currentTurn);
  const isMyTurn = playerSide == playerTurn;

  const [messages, setMessages] = useState<Message[]>(() => {
    let array: Message[] = [];

    if (playerSide == "A")
      array.push({
        side: "AI",
        content: t("aiFirstMessageA"),
        target: "A",
      });
    else
      array.push({
        side: "AI",
        content: t("aiFirstMessageB"),
        target: "B",
      });

    if (InitialMessages) array = [...array, ...InitialMessages];

    return array;
  });

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);

          if (payload.new.side != "AI") {
            if (payload.new.side == "A") {
              setPlayerTurn("B");
            } else {
              setPlayerTurn("A");
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return (
    <main className="h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="bg-violet-950/10 flex flex-col h-full w-full md:w-10/12  md:mx-auto p-2 border border-gray/50">
        <TopBar
          topic={topic}
          maxRounds={maxRounds}
          turn={messages?.filter((m) => m.side == "B").length || 0}
          isMyTurn={isMyTurn}
        />
        {messages?.length > 0 ? (
          <Messages playerSide={playerSide} messages={messages} />
        ) : (
          <div className="flex-1"></div>
        )}
        <SendMessage
          isMyTurn={isMyTurn}
          playerSide={playerSide}
          roomId={roomId}
          topic={topic}
        />
      </div>
    </main>
  );
}

function TopBar({
  topic,
  maxRounds,
  turn,
  isMyTurn,
}: {
  topic: string;
  maxRounds: string;
  turn: number;
  isMyTurn: boolean;
}) {
  const t = useTranslations("debate");

  return (
    <div className="border-b border-b-gray/50 p-2 flex justify-between">
      <span className="text-muted-foreground">
        {t("topic")}:{" "}
        <span className="text-purple-300/70">
          {'"'}
          {topic}
          {'"'}
        </span>
      </span>
      <div className="flex gap-1">
        {Array.from({ length: parseInt(maxRounds) }).map((_, i) => {
          if (i < turn) {
            return <CircleCheck key={i} className="text-purple-500" />;
          } else return <Circle key={i} className="text-gray-500" />;
        })}
      </div>
      <div className="text- font-semibold p-1 px-3 text-white rounded-2xl border border-purple-200/50">
        {isMyTurn ? t("yourTurn") : t("opponentTurn")}
      </div>
    </div>
  );
}

function Messages({
  messages,
  playerSide,
}: {
  messages: Message[];
  playerSide: "A" | "B";
}) {
  return (
    <div className="flex-1 flex flex-col gap-4  justify-end p-16  overflow-auto">
      {messages
        .filter(
          (m) =>
            m.side == playerSide || (m.side == "AI" && m.target == playerSide),
        )
        .sort(
          (a, b) =>
            new Date(a.created_at!).getTime() -
            new Date(b.created_at!).getTime(),
        )
        .map((m, i) => (
          <Message key={`message${i}`} content={m.content} side={m.side} />
        ))}
    </div>
  );
}

function Message({
  content,
  side,
}: {
  content: string;
  side: "A" | "B" | "AI";
}) {
  const t = useTranslations("debate");
  return (
    <div
      className={`flex flex-col gap-2 max-w-lg ${side == "AI" ? "self-start" : "self-end"} `}
    >
      {side == "AI" && (
        <span className="text-start text-xs  text-purple-400 text-shadow-sm text-shadow-purple-500">
          Ruld AI
        </span>
      )}
      <div className="p-4 bg-purple-900/25 rounded-lg">{content}</div>
      {side != "AI" && (
        <span className="text-end text-xs text-muted-foreground">
          {t("you")}
        </span>
      )}
    </div>
  );
}

function SendMessage({
  isMyTurn,
  playerSide,
  roomId,
  topic,
}: {
  isMyTurn: boolean;
  playerSide: "A" | "B";
  roomId: string;
  topic: string;
}) {
  const t = useTranslations("debate");
  const [state, formAction, pending] = useActionState(sendMessage, null);

  return (
    <form action={formAction} className="flex gap-2">
      <Input
        name="content"
        className="border border-gray/50 bg-purple-950/20 text-white p-2 flex-1"
        placeholder={
          isMyTurn ? t("writeYourArgument") : t("waitingForOpponent")
        }
        disabled={!isMyTurn || pending}
      />
      <input type="hidden" name="side" value={playerSide} />
      <input type="hidden" name="roomId" value={roomId} />
      <input type="hidden" name="topic" value={topic} />
      <Button
        variant="outline"
        className="bg-purple-600/20"
        disabled={!isMyTurn || pending}
        type="submit"
      >
        <Send />
      </Button>
    </form>
  );
}
