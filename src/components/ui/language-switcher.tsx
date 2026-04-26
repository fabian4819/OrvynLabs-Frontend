"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/request";

const languages = {
  en: { name: "English", flag: "🇺🇸", code: "EN" },
  id: { name: "Bahasa Indonesia", flag: "🇮🇩", code: "ID" },
};

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (locale: Locale) => {
    startTransition(() => {
      // Set locale cookie
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;

      // Reload to apply new locale
      window.location.reload();
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold px-2"
          disabled={isPending}
        >
          {languages[currentLocale].flag} {languages[currentLocale].code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-morphism">
        {(Object.keys(languages) as Locale[]).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? "bg-white/10" : ""}
          >
            <span className="mr-2">{languages[locale].flag}</span>
            {languages[locale].code}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
