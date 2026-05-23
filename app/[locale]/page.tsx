"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/lib/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { Nunito } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"] });

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <BackgroundOrbs />
      <TextComponent />
      <CTAButton />
      <StepsComponent />
      <ChangeLanguageComponent />
    </main>
  );
}

function CTAButton() {
  const t = useTranslations("home");

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-violet-900">
            {t("startDebate")}
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-black/40">
          <DialogHeader>
            <DialogTitle> {t("createRoom")} </DialogTitle>
            <DialogDescription className="mt-4" asChild>
              <div className="flex flex-col gap-4">
                <span className="text-sm sm:text-md font-semibold">
                  {t("whatIsTheArgueAbout")}
                </span>
                <Textarea></Textarea>
                <span className="text-sm sm:text-md font-semibold">
                  {t("whatIsYourName")}
                </span>
                <Input />

                <Button>{t("start")}</Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TextComponent() {
  const t = useTranslations("home");

  return (
    <div className="flex justify-center flex-col items-center">
      <h1
        className={` ${nunito.className} text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-5xl md:text-8xl font-black tracking-tighter`}
      >
        {t("title")}
      </h1>
      <p className="text-sm md:text-base text-muted-foreground max-w-sm text-center">
        {t("subtitle")}
      </p>
    </div>
  );
}

function ChangeLanguageComponent() {
  const locale = useLocale();
  return (
    <div className="flex gap-2 text-muted-foreground">
      <Link
        locale="en"
        href="/"
        className={locale == "en" ? "text-violet-700" : ""}
      >
        EN
      </Link>{" "}
      /
      <Link
        locale="tr"
        href="/"
        className={locale == "tr" ? "text-violet-700" : ""}
      >
        TR
      </Link>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div>
      <div className="absolute w-50 h-50 md:w-75 md:h-75 rounded-full bg-[#7F77DD] opacity-25 blur-[80px] -top-20 -left-16 pointer-events-none" />
      <div className="absolute w-37.5 h-37.5 md:w-50 md:h-50 rounded-full bg-[#534AB7] opacity-25 blur-[80px] -bottom-10 -right-10 pointer-events-none" />
      <div className="absolute w-25 h-25 md:w-37.5 md:h-37.5 rounded-full bg-[#AFA9EC] opacity-25 blur-[80px] top-[40%] left-[60%] pointer-events-none" />
    </div>
  );
}

function StepsComponent() {
  const t = useTranslations("home");

  return (
    <div className="flex flex-col sm:flex-row gap-8">
      {["createRoom", "inviteFriend", "argueWithFriend", "aiVerdicts"].map(
        (step, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center  gap-8 "
          >
            <div className="flex flex-col gap-2 items-center">
              <div className="w-10 h-10  items-center flex justify-center text-md font-semibold text-[#AFA9EC] rounded-full bg-violet-900/60 border border-violet-500/80 ">
                {i + 1}
              </div>
              <span className="text-center font-semibold tracking-wide leading-tight text-muted-foreground">
                {t(step)}
              </span>
            </div>

            {i < 3 && (
              <div className="h-4 sm:h-px w-px sm:w-16   bg-violet-950"></div>
            )}
          </div>
        ),
      )}
    </div>
  );
}
