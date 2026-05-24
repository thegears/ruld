import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <main className="min-h-screen   bg-[#0a0a0f] relative overflow-hidden  flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex justify-center flex-col gap-3 items-center">
        <h1
          className={`text-shadow-lg text-shadow-violet-900/70 text-muted-foreground text-5xl md:text-8xl font-black tracking-tighter`}
        >
          404
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-sm text-center">
          {t("notFound")}
        </p>
        <Link href="/">
          <Button> {t("home")} </Button>
        </Link>
      </div>
    </main>
  );
}
