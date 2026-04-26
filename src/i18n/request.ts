import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export type Locale = "en";

export const locales: Locale[] = ["en"];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || defaultLocale) as Locale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
