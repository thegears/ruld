import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";
import type { NextRequest } from "next/server";

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  let userId = request.cookies.get("ruld_user_id")?.value;

  if (!userId) {
    userId = crypto.randomUUID();
    response.cookies.set("ruld_user_id", userId, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
