import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useActionState, useEffect } from "react";
import { joinRoom } from "@/app/actions/room";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";

export default function Join({
  playerAName,
  userId,
  roomId,
  topic,
  setPlayerB,
  setMaxRounds,
}: {
  playerAName: string;
  userId: string;
  roomId: string;
  topic: string;
  setPlayerB: (id: string) => void;
  setMaxRounds: (maxRounds: number) => void;
}) {
  const t = useTranslations("join");
  const [state, formAction, pending] = useActionState(joinRoom, null);

  useEffect(() => {
    if (state?.success) {
      setPlayerB(userId);
      setMaxRounds(state?.maxRounds as number);
    }
  }, []);

  return (
    <main className="min-h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex justify-center flex-col gap-3 items-center">
        <h1
          className={`text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-2xl md:text-4xl font-black tracking-tighter`}
        >
          {playerAName} {t("invitedYou")}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-sm text-center">
          {t("topic")} :
        </p>
        <div className="overflow-auto w-lg max-h-32 border border-violet-950 p-4">
          {topic}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button> {t("join")} </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/40">
            <DialogHeader>
              <DialogTitle> {t("joinRoom")} </DialogTitle>
              <DialogDescription className="mt-4" asChild>
                <form action={formAction} className="flex flex-col gap-4">
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="topic" value={topic} />

                  <span className="text-sm sm:text-md font-semibold">
                    {t("whatIsYourName")}
                  </span>
                  <Input name="name" />

                  {state?.error && (
                    <span className="text-destructive text-center">
                      {t(state.error)}
                    </span>
                  )}

                  <Button type="submit" disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" /> : t("join")}
                  </Button>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
