"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  DEFAULT_LOCALE,
  isEnglishLocale,
  isFullPageTranslationAllowed,
  isSupportedLocale,
  localeDirection,
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  matchSupportedLocale,
  message,
  type LocalizedMessageKey,
  type ObserraLocale,
} from "../lib/regional-localization";

const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "INPUT", "TEXTAREA", "SELECT", "OPTION"]);
const DO_NOT_TRANSLATE_SELECTOR = "[data-obserra-no-translate], [data-obserra-localized], [translate='no'], [contenteditable='true']";
const MAX_BATCH_STRINGS = 70;
const MAX_BATCH_CHARS = 17_500;
const LOCALIZATION_UI_BLOCKED_PREFIXES = [
  "/admin",
  "/api",
  "/auth",
  "/checkout",
  "/command-center",
  "/owner-access",
  "/portal",
  "/sign-in",
  "/sign-up",
  "/academy/admin",
  "/academy/certificate",
  "/academy/learn",
  "/academy/success",
  "/apps/subscribe",
  "/florida-security-training/access",
  "/florida-security-training/admin",
  "/florida-security-training/completion",
  "/florida-security-training/enroll",
  "/florida-security-training/exam",
  "/florida-security-training/identity",
  "/florida-security-training/live",
  "/florida-security-training/makeup",
  "/florida-security-training/observer",
  "/florida-security-training/owner-preview",
] as const;

type LocaleContextValue = {
  locale: ObserraLocale;
  ready: boolean;
  localizationUiAllowed: boolean;
  translationAllowed: boolean;
  setLocale: (locale: ObserraLocale) => void;
  t: (key: LocalizedMessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function browserLocale() {
  if (typeof navigator === "undefined") return null;
  for (const candidate of navigator.languages ?? [navigator.language]) {
    const matched = matchSupportedLocale(candidate);
    if (matched) return matched;
  }
  return null;
}

function localizationUiAllowed(pathname: string) {
  const clean = pathname.split("?")[0]?.split("#")[0] || "/";
  return !LOCALIZATION_UI_BLOCKED_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

function publicTextNode(node: Text, root: HTMLElement) {
  const parent = node.parentElement;
  if (!parent || !root.contains(parent)) return false;
  if (SKIPPED_TAGS.has(parent.tagName)) return false;
  if (parent.closest(DO_NOT_TRANSLATE_SELECTOR)) return false;
  const value = node.nodeValue?.trim() ?? "";
  if (value.length < 2 || value.length > 900) return false;
  return /\p{L}/u.test(value);
}

function whitespaceParts(value: string) {
  return {
    leading: value.match(/^\s*/)?.[0] ?? "",
    trailing: value.match(/\s*$/)?.[0] ?? "",
  };
}

function splitBatches(strings: string[]) {
  const batches: string[][] = [];
  let current: string[] = [];
  let currentChars = 0;

  for (const source of strings) {
    if (current.length >= MAX_BATCH_STRINGS || currentChars + source.length > MAX_BATCH_CHARS) {
      if (current.length) batches.push(current);
      current = [];
      currentChars = 0;
    }
    current.push(source);
    currentChars += source.length;
  }
  if (current.length) batches.push(current);
  return batches;
}

export function useObserraLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useObserraLocale must be used inside RegionalLocalizationProvider");
  return value;
}

export function RegionalLocalizationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [selectedLocale, setLocaleState] = useState<ObserraLocale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);
  const allowLocalizationUi = localizationUiAllowed(pathname);
  const locale = allowLocalizationUi ? selectedLocale : DEFAULT_LOCALE;
  const translationAllowed = allowLocalizationUi && isFullPageTranslationAllowed(pathname);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(async () => {
      if (cancelled) return;

      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isSupportedLocale(stored)) {
        setLocaleState(stored);
        setReady(true);
        return;
      }

      const immediate = browserLocale();
      if (immediate && !cancelled) setLocaleState(immediate);

      try {
        const response = await fetch("/api/locale", { cache: "no-store", credentials: "same-origin" });
        if (!response.ok) throw new Error("locale_resolution_failed");
        const payload = (await response.json()) as { locale?: unknown };
        if (!cancelled && isSupportedLocale(payload.locale)) setLocaleState(payload.locale);
      } catch {
        if (!cancelled && immediate) setLocaleState(immediate);
      } finally {
        if (!cancelled) setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirection(locale);
    document.documentElement.dataset.obserraLocale = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: ObserraLocale) => {
    setLocaleState(nextLocale);
    setReady(true);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
    void fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ locale: nextLocale }),
    }).catch(() => undefined);
  }, []);

  const t = useCallback((key: LocalizedMessageKey) => message(locale, key), [locale]);
  const contextValue = useMemo(
    () => ({ locale, ready, localizationUiAllowed: allowLocalizationUi, translationAllowed, setLocale, t }),
    [allowLocalizationUi, locale, ready, setLocale, t, translationAllowed],
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
      <PublicPageTranslator />
    </LocaleContext.Provider>
  );
}

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { locale, ready, localizationUiAllowed: allowLocalizationUi, setLocale, t, translationAllowed } = useObserraLocale();
  if (!allowLocalizationUi) return null;

  const status = !isEnglishLocale(locale)
    ? translationAllowed
      ? t("locale.translated")
      : t("locale.restricted")
    : t("locale.auto");

  return (
    <label
      className={`obs-locale-control ${className}`.trim()}
      data-obserra-localized
      title={status}
    >
      <span className="obs-locale-control__label">{t("locale.label")}</span>
      <select
        aria-label={t("locale.label")}
        value={locale}
        disabled={!ready}
        onChange={(event) => {
          if (isSupportedLocale(event.target.value)) setLocale(event.target.value);
        }}
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.locale} value={option.locale}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function RegionalTranslationNotice() {
  const { locale, ready, localizationUiAllowed: allowLocalizationUi, translationAllowed, t } = useObserraLocale();
  if (!allowLocalizationUi || !ready || isEnglishLocale(locale)) return null;
  return (
    <div className="obs-translation-notice" data-obserra-localized role="status">
      <span>{translationAllowed ? t("locale.translated") : t("locale.restricted")}</span>
    </div>
  );
}

function PublicPageTranslator() {
  const pathname = usePathname();
  const { locale, ready, translationAllowed } = useObserraLocale();
  const originalsRef = useRef(new WeakMap<Text, string>());
  const translatedNodesRef = useRef(new Set<Text>());
  const cacheRef = useRef(new Map<string, string>());
  const generationRef = useRef(0);

  const restore = useCallback(() => {
    for (const node of translatedNodesRef.current) {
      const original = originalsRef.current.get(node);
      if (original !== undefined && node.isConnected && node.nodeValue !== original) node.nodeValue = original;
    }
    translatedNodesRef.current.clear();
    document.documentElement.dataset.obserraTranslation = "english";
  }, []);

  const translateRoot = useCallback(async (root: HTMLElement, signal: AbortSignal, generation: number) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodesBySource = new Map<string, Text[]>();
    let current = walker.nextNode();
    while (current) {
      const textNode = current as Text;
      if (publicTextNode(textNode, root)) {
        const original = originalsRef.current.get(textNode) ?? textNode.nodeValue ?? "";
        if (!originalsRef.current.has(textNode)) originalsRef.current.set(textNode, original);
        const source = original.trim();
        if (source) {
          const group = nodesBySource.get(source) ?? [];
          group.push(textNode);
          nodesBySource.set(source, group);
        }
      }
      current = walker.nextNode();
    }

    const translations = new Map<string, string>();
    const missing: string[] = [];
    for (const source of nodesBySource.keys()) {
      const cached = cacheRef.current.get(`${locale}\u0000${source}`);
      if (cached) translations.set(source, cached);
      else missing.push(source);
    }

    for (const batch of splitBatches(missing)) {
      if (signal.aborted || generationRef.current !== generation) return;
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ locale, pathname, strings: batch }),
        signal,
      });
      if (!response.ok) throw new Error(`translation_${response.status}`);
      const payload = (await response.json()) as { translations?: unknown; translated?: unknown };
      if (payload.translated !== true || !Array.isArray(payload.translations) || payload.translations.length !== batch.length) {
        throw new Error("translation_unavailable");
      }
      batch.forEach((source, index) => {
        const translated = payload.translations?.[index];
        if (typeof translated !== "string" || !translated.trim()) return;
        translations.set(source, translated.trim());
        cacheRef.current.set(`${locale}\u0000${source}`, translated.trim());
      });
    }

    if (signal.aborted || generationRef.current !== generation) return;
    for (const [source, nodes] of nodesBySource) {
      const translated = translations.get(source);
      if (!translated) continue;
      for (const node of nodes) {
        const original = originalsRef.current.get(node);
        if (original === undefined || !node.isConnected) continue;
        const { leading, trailing } = whitespaceParts(original);
        const nextValue = `${leading}${translated}${trailing}`;
        if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
        translatedNodesRef.current.add(node);
      }
    }
    document.documentElement.dataset.obserraTranslation = locale;
  }, [locale, pathname]);

  useEffect(() => {
    generationRef.current += 1;
    const generation = generationRef.current;
    const controller = new AbortController();
    let timer: number | null = null;
    let observer: MutationObserver | null = null;

    if (!ready || isEnglishLocale(locale) || !translationAllowed) {
      restore();
      return () => controller.abort();
    }

    const run = () => {
      const root = document.getElementById("main-content");
      if (!root) return;
      void translateRoot(root, controller.signal, generation).catch(() => {
        if (!controller.signal.aborted && generationRef.current === generation) {
          document.documentElement.dataset.obserraTranslation = "unavailable";
        }
      });
    };

    const schedule = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(run, 320);
    };

    schedule();
    const root = document.getElementById("main-content");
    if (root) {
      observer = new MutationObserver(schedule);
      observer.observe(root, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      controller.abort();
      observer?.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [locale, pathname, ready, restore, translateRoot, translationAllowed]);

  return null;
}
