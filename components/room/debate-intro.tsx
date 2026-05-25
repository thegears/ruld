import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";
import { useTranslations } from "next-intl";

export default function DebateIntro({
  onFinish,
  roundCount,
}: {
  onFinish: () => void;
  roundCount: string;
}) {
  const [progress, setProgress] = useState(100);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      onFinish();
    }
  }, [onFinish, done]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 10) {
          clearInterval(interval);
          setDone(true);
          return 0;
        }
        return prev - 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const t = useTranslations("debateIntro");
  return (
    <main className="min-h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex justify-center flex-col gap-3 items-center">
        <h1
          className={`text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-3xl md:text-5xl font-black tracking-tighter`}
        >
          {t("debateIsStarting")}
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-sm text-center">
          {t("roundCount")}
        </p>
        <p className="text-8xl font-black text-violet-900/60 text-shadow-lg text-shadow-white">
          {roundCount}
        </p>
        <Progress value={progress} />
        <p className="text-muted-foreground">
          {t("willBeStartedAfter")} {progress / 10}
        </p>
      </div>
    </main>
  );
}
