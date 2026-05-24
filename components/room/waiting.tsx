"use client";

import { useTranslations } from "next-intl";

import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";

export default function Waiting({ url }: { url: string }) {
  const t = useTranslations("waiting");
  const [copied, setCopied] = useState(false);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev === 3 ? 0 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex justify-center flex-col gap-4 items-center">
        <h1
          className={`text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-2xl md:text-5xl font-black tracking-tighter`}
        >
          {t("waitingForFriend")} {".".repeat(dots)}
        </h1>
        <h3>{t("inviteYourFriend")}</h3>
        <div className="flex relative">
          <div
            onClick={() => navigator.clipboard.writeText(url)}
            className="border cursor-no-drop border-violet-900 flex items-center  text-center text-muted-foreground p-4 w-full "
          >
            <div className="flex-1 text-xs sm:text-lg ">{url}</div>
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            variant="outline"
            className="justify-self-end h-16"
          >
            {copied ? <Check /> : <Copy size={16} />}
          </Button>
        </div>

        <p className="text-sm md:text-base text-muted-foreground max-w-sm text-center"></p>
      </div>
    </main>
  );
}
