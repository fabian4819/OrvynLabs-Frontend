# Internationalization (i18n) Guide

This guide explains how to use the multi-language support system in the Orvyn-Labs DApp.

---

## Overview

The application supports multiple languages using `next-intl`. Currently supported languages:

- **English (en)** - Default
- **Bahasa Indonesia (id)** - Indonesian

---

## Quick Start

### For Users

1. **Switch Language**: Click the language switcher in the navbar (globe icon)
2. **Selection Persists**: Your language preference is saved in a cookie
3. **Reload Required**: Page reloads automatically when changing language

### For Developers

Add new translated strings:

```typescript
// 1. Add to /src/locales/en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Description text"
  }
}

// 2. Add to /src/locales/id.json
{
  "myFeature": {
    "title": "Fitur Saya",
    "description": "Teks deskripsi"
  }
}

// 3. Use in components
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("myFeature");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

---

## Architecture

### File Structure

```
frontend/
├── src/
│   ├── i18n/
│   │   └── request.ts           # i18n configuration
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   └── id.json              # Indonesian translations
│   ├── components/
│   │   └── ui/
│   │       └── language-switcher.tsx  # Language selector
│   ├── app/
│   │   ├── layout.tsx           # Loads locale & messages
│   │   └── providers.tsx        # NextIntlClientProvider wrapper
│   └── ...
└── next.config.ts               # Next.js + next-intl plugin
```

### How It Works

1. **Locale Detection**: Read from `NEXT_LOCALE` cookie
2. **Message Loading**: Dynamically import JSON based on locale
3. **Provider Injection**: `NextIntlClientProvider` wraps app
4. **Hook Usage**: `useTranslations()` in client components
5. **Persistence**: Cookie stores selected language

---

## Usage Patterns

### Client Components

```typescript
"use client";

import { useTranslations } from "next-intl";

export function MyComponent() {
  // Use a namespace from JSON
  const t = useTranslations("common");

  return (
    <button>{t("submit")}</button>
  );
}
```

### Multiple Namespaces

```typescript
const tCommon = useTranslations("common");
const tNav = useTranslations("nav");

<>
  <h1>{tNav("projects")}</h1>
  <button>{tCommon("cancel")}</button>
</>
```

### With Variables (Interpolation)

```typescript
// In JSON:
{
  "greeting": "Hello, {name}!"
}

// In code:
t("greeting", { name: "Alice" })
// Output: "Hello, Alice!"
```

### Pluralization

```typescript
// In JSON:
{
  "items": "{count, plural, =0 {No items} one {1 item} other {# items}}"
}

// In code:
t("items", { count: 5 })
// Output: "5 items"
```

---

## Translation File Structure

### Namespace Organization

Organize translations by feature/page:

```json
{
  "common": { /* Shared strings */ },
  "nav": { /* Navigation */ },
  "home": { /* Home page */ },
  "projects": { /* Projects page */ },
  "stake": { /* Staking page */ },
  // ... more features
}
```

### Best Practices

1. **Use Descriptive Keys**
   ```json
   // Good
   {
     "projectCard": {
       "goal": "Goal",
       "raised": "Raised"
     }
   }

   // Bad
   {
     "text1": "Goal",
     "text2": "Raised"
   }
   ```

2. **Group Related Strings**
   ```json
   {
     "createProject": {
       "form": {
         "title": "Project Title",
         "titlePlaceholder": "Enter title..."
       }
     }
   }
   ```

3. **Consistent Naming**
   - Use camelCase for keys
   - Use descriptive context prefixes
   - Keep structure aligned across languages

---

## Adding a New Language

1. **Update i18n Config**
   ```typescript
   // src/i18n/request.ts
   export const locales: Locale[] = ["en", "id", "es"]; // Add "es"
   export type Locale = "en" | "id" | "es";
   ```

2. **Create Translation File**
   ```bash
   cp src/locales/en.json src/locales/es.json
   # Then translate all strings
   ```

3. **Update Language Switcher**
   ```typescript
   // src/components/ui/language-switcher.tsx
   const languages = {
     en: { name: "English", flag: "🇺🇸" },
     id: { name: "Bahasa Indonesia", flag: "🇮🇩" },
     es: { name: "Español", flag: "🇪🇸" }, // Add here
   };
   ```

4. **Test**
   - Switch to new language
   - Verify all pages render correctly
   - Check for missing translation warnings in console

---

## Common Translation Keys

### Status Messages

```json
{
  "common": {
    "loading": "Loading...",
    "success": "Success!",
    "error": "Error occurred",
    "confirm": "Confirm",
    "cancel": "Cancel"
  }
}
```

### Form Labels

```json
{
  "form": {
    "title": "Title",
    "description": "Description",
    "submit": "Submit",
    "reset": "Reset"
  }
}
```

### Transaction States

```json
{
  "tx": {
    "pending": "Transaction pending...",
    "confirmed": "Transaction confirmed",
    "failed": "Transaction failed"
  }
}
```

---

## Testing

### Manual Testing

1. Switch to Indonesian
2. Navigate through all pages
3. Check:
   - All text is translated
   - No missing keys (shows key name instead)
   - Proper grammar and context

### Console Warnings

Next-intl logs warnings for:
- Missing keys
- Unused translations
- Namespace errors

Check browser console during development.

---

## Migration Checklist

To fully translate an existing page:

- [ ] Identify all hardcoded strings
- [ ] Add English keys to `en.json`
- [ ] Add Indonesian keys to `id.json`
- [ ] Import `useTranslations` in component
- [ ] Replace strings with `t("key")` calls
- [ ] Test both languages
- [ ] Check for missing translations

---

## Current Translation Status

| Page/Feature | English | Indonesian | Notes |
|--------------|---------|------------|-------|
| Navbar | ✅ | ✅ | Fully translated |
| Common UI | ✅ | ✅ | Buttons, forms, etc. |
| Home | ⚠️ | ⚠️ | Partially translated |
| Projects | ⚠️ | ⚠️ | Partially translated |
| Staking | ⚠️ | ⚠️ | Partially translated |
| Analytics | ⚠️ | ⚠️ | Partially translated |
| Leaderboard | ⚠️ | ⚠️ | Partially translated |
| History | ⚠️ | ⚠️ | Partially translated |
| Profile | ⚠️ | ⚠️ | Partially translated |
| Help | ⚠️ | ⚠️ | Partially translated |
| Export Dialog | ⚠️ | ⚠️ | Partially translated |

**Note**: Translation JSON files contain all necessary keys. Pages need to be migrated to use `useTranslations()` hook instead of hardcoded strings.

---

## Roadmap

### Phase 1: Infrastructure ✅
- [x] Install next-intl
- [x] Configure i18n system
- [x] Create translation files
- [x] Add language switcher
- [x] Integrate into layout

### Phase 2: Translation (In Progress)
- [x] Navbar
- [ ] Home page
- [ ] Projects page
- [ ] Project detail page
- [ ] Staking page
- [ ] Analytics page
- [ ] Profile page
- [ ] Other pages

### Phase 3: Optimization
- [ ] Lazy load translations
- [ ] Add missing keys validation
- [ ] Create translation helper scripts
- [ ] Add more languages (if needed)

---

## Troubleshooting

### "Cannot read messages" Error

**Cause**: Locale not loaded properly

**Fix**: Check that locale cookie is set and JSON file exists

```typescript
// Debug in browser console:
document.cookie.split(';').find(c => c.includes('NEXT_LOCALE'))
```

### Missing Translation Shows Key Name

**Cause**: Key doesn't exist in JSON

**Fix**: Add the key to both `en.json` and `id.json`

### Language Doesn't Change

**Cause**: Cookie not set or page not reloaded

**Fix**:
- Check browser's cookie storage
- Force reload: `window.location.reload()`

### Hydration Mismatch

**Cause**: Server renders one language, client expects another

**Fix**: Ensure cookie is read server-side in `layout.tsx`

---

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Translation Best Practices](https://next-intl-docs.vercel.app/docs/workflows/typescript)

---

## Contributing

When adding new features:

1. Add English strings first
2. Add Indonesian translations immediately (or mark as TODO)
3. Use descriptive namespace and keys
4. Test both languages before PR
5. Update this guide if adding new patterns

---

**Last Updated**: 2026-04-20
**Current Version**: MVP 1.0 (i18n Phase 1)
