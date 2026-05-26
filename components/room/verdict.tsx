import { getVerdict } from "@/app/actions/room";
import { useTranslations } from "next-intl";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

export default function Verdict({ roomId }: { roomId: string }) {
  const t = useTranslations("verdict");
  const [room, setRoom] = useState<{ winner: string; reasoning: string }>();
  const [pending, setPending] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: verdict } = await getVerdict(roomId);

      console.log(verdict);

      setRoom(verdict);

      setPending(false);

      if (!verdict) return setIsNotFound(true);
    })();
  }, []);

  if (pending) return <></>;
  else if (isNotFound) return notFound();

  return (
    <main className="min-h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex justify-center flex-col gap-3 items-center">
        <h1
          className={`text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-3xl md:text-5xl font-black tracking-tighter`}
        >
          {t("debateIsOver")}
        </h1>
        <p className="text-sm md:text-sm text-muted-foreground max-w-sm text-center">
          {t("reason")}
        </p>
        <div className="text-sm md:text-base text-muted-foreground max-w-sm md:max-w-lg text-center text-shadow-2xs text-shadow-purple-400 overflow-auto rounded-md p-4 bg-[#1a1a1f]/50 max-h-48">
          {room!.reasoning}
        </div>
      </div>
    </main>
  );
}
