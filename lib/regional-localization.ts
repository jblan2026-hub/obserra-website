export const DEFAULT_LOCALE = "en-US" as const;
export const LOCALE_COOKIE = "obserra_locale";
export const LOCALE_STORAGE_KEY = "obserra.locale";
export const TRANSLATION_CACHE_VERSION = "2026-08-17-v1";

export const SUPPORTED_LOCALES = [
  "en-US",
  "en-GB",
  "es-419",
  "es-ES",
  "fr-FR",
  "de-DE",
  "pt-BR",
  "pt-PT",
  "it-IT",
  "nl-NL",
  "ar",
  "hi-IN",
  "ja-JP",
  "ko-KR",
  "zh-CN",
] as const;

export type ObserraLocale = (typeof SUPPORTED_LOCALES)[number];
export type LocalizedMessageKey = keyof typeof ENGLISH_MESSAGES;

export const LOCALE_OPTIONS: ReadonlyArray<{
  locale: ObserraLocale;
  label: string;
  region: string;
  direction: "ltr" | "rtl";
}> = [
  { locale: "en-US", label: "English (US)", region: "North America", direction: "ltr" },
  { locale: "en-GB", label: "English (UK)", region: "United Kingdom", direction: "ltr" },
  { locale: "es-419", label: "Español (Latinoamérica)", region: "Latin America", direction: "ltr" },
  { locale: "es-ES", label: "Español (España)", region: "Spain", direction: "ltr" },
  { locale: "fr-FR", label: "Français", region: "France and Francophone", direction: "ltr" },
  { locale: "de-DE", label: "Deutsch", region: "DACH", direction: "ltr" },
  { locale: "pt-BR", label: "Português (Brasil)", region: "Brazil", direction: "ltr" },
  { locale: "pt-PT", label: "Português (Portugal)", region: "Portugal", direction: "ltr" },
  { locale: "it-IT", label: "Italiano", region: "Italy", direction: "ltr" },
  { locale: "nl-NL", label: "Nederlands", region: "Netherlands", direction: "ltr" },
  { locale: "ar", label: "العربية", region: "Middle East and North Africa", direction: "rtl" },
  { locale: "hi-IN", label: "हिन्दी", region: "India", direction: "ltr" },
  { locale: "ja-JP", label: "日本語", region: "Japan", direction: "ltr" },
  { locale: "ko-KR", label: "한국어", region: "Korea", direction: "ltr" },
  { locale: "zh-CN", label: "简体中文", region: "Mainland China and Singapore", direction: "ltr" },
] as const;

const ENGLISH_MESSAGES = {
  "nav.eios": "EIOS",
  "nav.services": "Services",
  "nav.applications": "Applications",
  "nav.academy": "Academy",
  "nav.industries": "Industries",
  "nav.trust": "Trust",
  "nav.about": "About",
  "nav.speaking": "Speaking",
  "nav.resources": "Resources",
  "nav.florida": "Florida training",
  "nav.contact": "Contact",
  "nav.talk": "Talk to Obserra",
  "nav.utility": "Enterprise intelligence · Cybersecurity · AI governance · Protective intelligence",
  "footer.obserra": "Obserra",
  "footer.company": "Company",
  "footer.trust": "Trust",
  "footer.eios": "EIOS platform",
  "footer.services": "Enterprise services",
  "footer.apps": "Applications Marketplace",
  "footer.academy": "Obserra Academy",
  "footer.protection": "Protection and intelligence",
  "footer.industries": "Industries",
  "footer.leadership": "Leadership and credentials",
  "footer.speaking": "Speaking and briefings",
  "footer.privacy": "Privacy",
  "footer.security": "Security",
  "footer.accessibility": "Accessibility",
  "footer.start": "Start an executive conversation",
  "locale.label": "Language and region",
  "locale.auto": "Regional language detected automatically",
  "locale.translated": "Automated translation is active. English remains controlling for legal and regulated content.",
  "locale.restricted": "This regulated or legal page remains in authoritative English.",
  "advisor.ask": "Ask Obserrian",
  "advisor.send": "Send",
  "advisor.working": "Working",
} as const;

const MESSAGE_OVERRIDES: Partial<Record<ObserraLocale, Partial<Record<LocalizedMessageKey, string>>>> = {
  "es-419": {
    "nav.services": "Servicios", "nav.applications": "Aplicaciones", "nav.academy": "Academia", "nav.industries": "Industrias", "nav.trust": "Confianza", "nav.about": "Nosotros", "nav.speaking": "Conferencias", "nav.resources": "Recursos", "nav.florida": "Capacitación en Florida", "nav.contact": "Contacto", "nav.talk": "Hablar con Obserra", "nav.utility": "Inteligencia empresarial · Ciberseguridad · Gobernanza de IA · Inteligencia de protección", "footer.company": "Empresa", "footer.trust": "Confianza", "footer.services": "Servicios empresariales", "footer.apps": "Mercado de aplicaciones", "footer.protection": "Protección e inteligencia", "footer.leadership": "Liderazgo y credenciales", "footer.speaking": "Conferencias y sesiones informativas", "footer.privacy": "Privacidad", "footer.security": "Seguridad", "footer.accessibility": "Accesibilidad", "footer.start": "Iniciar una conversación ejecutiva", "locale.label": "Idioma y región", "locale.auto": "Idioma regional detectado automáticamente", "locale.translated": "La traducción automática está activa. El inglés sigue siendo la versión de control para contenido legal y regulado.", "locale.restricted": "Esta página legal o regulada permanece en inglés autorizado.", "advisor.ask": "Preguntar a Obserrian", "advisor.send": "Enviar", "advisor.working": "Analizando"
  },
  "es-ES": {
    "nav.services": "Servicios", "nav.applications": "Aplicaciones", "nav.academy": "Academia", "nav.industries": "Sectores", "nav.trust": "Confianza", "nav.about": "Nosotros", "nav.speaking": "Conferencias", "nav.resources": "Recursos", "nav.florida": "Formación en Florida", "nav.contact": "Contacto", "nav.talk": "Hablar con Obserra", "nav.utility": "Inteligencia empresarial · Ciberseguridad · Gobernanza de IA · Inteligencia de protección", "footer.company": "Empresa", "footer.trust": "Confianza", "footer.services": "Servicios empresariales", "footer.apps": "Mercado de aplicaciones", "footer.protection": "Protección e inteligencia", "footer.leadership": "Liderazgo y credenciales", "footer.speaking": "Conferencias y sesiones informativas", "footer.privacy": "Privacidad", "footer.security": "Seguridad", "footer.accessibility": "Accesibilidad", "footer.start": "Iniciar una conversación ejecutiva", "locale.label": "Idioma y región", "locale.auto": "Idioma regional detectado automáticamente", "locale.translated": "La traducción automática está activa. El inglés sigue siendo la versión de control para contenido legal y regulado.", "locale.restricted": "Esta página legal o regulada permanece en inglés autorizado.", "advisor.ask": "Preguntar a Obserrian", "advisor.send": "Enviar", "advisor.working": "Analizando"
  },
  "fr-FR": {
    "nav.services": "Services", "nav.applications": "Applications", "nav.academy": "Académie", "nav.industries": "Secteurs", "nav.trust": "Confiance", "nav.about": "À propos", "nav.speaking": "Conférences", "nav.resources": "Ressources", "nav.florida": "Formation en Floride", "nav.contact": "Contact", "nav.talk": "Parler à Obserra", "nav.utility": "Intelligence d’entreprise · Cybersécurité · Gouvernance de l’IA · Intelligence de protection", "footer.company": "Entreprise", "footer.trust": "Confiance", "footer.services": "Services aux entreprises", "footer.apps": "Place de marché des applications", "footer.protection": "Protection et renseignement", "footer.leadership": "Direction et références", "footer.speaking": "Conférences et briefings", "footer.privacy": "Confidentialité", "footer.security": "Sécurité", "footer.accessibility": "Accessibilité", "footer.start": "Démarrer une conversation exécutive", "locale.label": "Langue et région", "locale.auto": "Langue régionale détectée automatiquement", "locale.translated": "La traduction automatique est active. L’anglais reste la version de référence pour le contenu juridique et réglementé.", "locale.restricted": "Cette page juridique ou réglementée reste dans sa version anglaise de référence.", "advisor.ask": "Demander à Obserrian", "advisor.send": "Envoyer", "advisor.working": "Analyse"
  },
  "de-DE": {
    "nav.services": "Services", "nav.applications": "Anwendungen", "nav.academy": "Akademie", "nav.industries": "Branchen", "nav.trust": "Vertrauen", "nav.about": "Über uns", "nav.speaking": "Vorträge", "nav.resources": "Ressourcen", "nav.florida": "Florida Schulung", "nav.contact": "Kontakt", "nav.talk": "Mit Obserra sprechen", "nav.utility": "Unternehmensintelligenz · Cybersicherheit · KI Governance · Schutzintelligenz", "footer.company": "Unternehmen", "footer.trust": "Vertrauen", "footer.services": "Unternehmensservices", "footer.apps": "Anwendungsmarktplatz", "footer.protection": "Schutz und Intelligence", "footer.leadership": "Führung und Qualifikationen", "footer.speaking": "Vorträge und Briefings", "footer.privacy": "Datenschutz", "footer.security": "Sicherheit", "footer.accessibility": "Barrierefreiheit", "footer.start": "Executive Gespräch starten", "locale.label": "Sprache und Region", "locale.auto": "Regionale Sprache automatisch erkannt", "locale.translated": "Automatische Übersetzung ist aktiv. Für rechtliche und regulierte Inhalte bleibt Englisch maßgeblich.", "locale.restricted": "Diese rechtliche oder regulierte Seite bleibt in der maßgeblichen englischen Fassung.", "advisor.ask": "Obserrian fragen", "advisor.send": "Senden", "advisor.working": "Analyse"
  },
  "pt-BR": {
    "nav.services": "Serviços", "nav.applications": "Aplicativos", "nav.academy": "Academia", "nav.industries": "Setores", "nav.trust": "Confiança", "nav.about": "Sobre", "nav.speaking": "Palestras", "nav.resources": "Recursos", "nav.florida": "Treinamento na Flórida", "nav.contact": "Contato", "nav.talk": "Falar com a Obserra", "nav.utility": "Inteligência empresarial · Cibersegurança · Governança de IA · Inteligência de proteção", "footer.company": "Empresa", "footer.trust": "Confiança", "footer.services": "Serviços empresariais", "footer.apps": "Mercado de aplicativos", "footer.protection": "Proteção e inteligência", "footer.leadership": "Liderança e credenciais", "footer.speaking": "Palestras e briefings", "footer.privacy": "Privacidade", "footer.security": "Segurança", "footer.accessibility": "Acessibilidade", "footer.start": "Iniciar uma conversa executiva", "locale.label": "Idioma e região", "locale.auto": "Idioma regional detectado automaticamente", "locale.translated": "A tradução automática está ativa. O inglês continua sendo a versão de controle para conteúdo jurídico e regulamentado.", "locale.restricted": "Esta página jurídica ou regulamentada permanece no inglês oficial.", "advisor.ask": "Perguntar ao Obserrian", "advisor.send": "Enviar", "advisor.working": "Analisando"
  },
  "pt-PT": {
    "nav.services": "Serviços", "nav.applications": "Aplicações", "nav.academy": "Academia", "nav.industries": "Setores", "nav.trust": "Confiança", "nav.about": "Sobre", "nav.speaking": "Palestras", "nav.resources": "Recursos", "nav.florida": "Formação na Florida", "nav.contact": "Contacto", "nav.talk": "Falar com a Obserra", "footer.company": "Empresa", "footer.trust": "Confiança", "footer.privacy": "Privacidade", "footer.security": "Segurança", "footer.accessibility": "Acessibilidade", "locale.label": "Idioma e região", "locale.translated": "A tradução automática está ativa. O inglês continua a ser a versão de controlo para conteúdo jurídico e regulamentado.", "locale.restricted": "Esta página jurídica ou regulamentada permanece no inglês oficial.", "advisor.ask": "Perguntar ao Obserrian", "advisor.send": "Enviar", "advisor.working": "A analisar"
  },
  "it-IT": {
    "nav.services": "Servizi", "nav.applications": "Applicazioni", "nav.academy": "Accademia", "nav.industries": "Settori", "nav.trust": "Affidabilità", "nav.about": "Chi siamo", "nav.speaking": "Interventi", "nav.resources": "Risorse", "nav.florida": "Formazione in Florida", "nav.contact": "Contatti", "nav.talk": "Parla con Obserra", "footer.company": "Azienda", "footer.trust": "Affidabilità", "footer.privacy": "Privacy", "footer.security": "Sicurezza", "footer.accessibility": "Accessibilità", "locale.label": "Lingua e regione", "locale.translated": "La traduzione automatica è attiva. L’inglese resta la versione di riferimento per i contenuti legali e regolamentati.", "locale.restricted": "Questa pagina legale o regolamentata resta nella versione inglese di riferimento.", "advisor.ask": "Chiedi a Obserrian", "advisor.send": "Invia", "advisor.working": "Analisi"
  },
  "nl-NL": {
    "nav.services": "Diensten", "nav.applications": "Applicaties", "nav.academy": "Academie", "nav.industries": "Sectoren", "nav.trust": "Vertrouwen", "nav.about": "Over ons", "nav.speaking": "Spreken", "nav.resources": "Bronnen", "nav.florida": "Florida training", "nav.contact": "Contact", "nav.talk": "Praat met Obserra", "footer.company": "Bedrijf", "footer.trust": "Vertrouwen", "footer.privacy": "Privacy", "footer.security": "Beveiliging", "footer.accessibility": "Toegankelijkheid", "locale.label": "Taal en regio", "locale.translated": "Automatische vertaling is actief. Engels blijft leidend voor juridische en gereguleerde inhoud.", "locale.restricted": "Deze juridische of gereguleerde pagina blijft in de leidende Engelse versie.", "advisor.ask": "Vraag Obserrian", "advisor.send": "Versturen", "advisor.working": "Analyseren"
  },
  "ar": {
    "nav.services": "الخدمات", "nav.applications": "التطبيقات", "nav.academy": "الأكاديمية", "nav.industries": "القطاعات", "nav.trust": "الثقة", "nav.about": "من نحن", "nav.speaking": "المحاضرات", "nav.resources": "الموارد", "nav.florida": "تدريب فلوريدا", "nav.contact": "اتصل بنا", "nav.talk": "تحدث مع Obserra", "nav.utility": "ذكاء المؤسسات · الأمن السيبراني · حوكمة الذكاء الاصطناعي · الاستخبارات الوقائية", "footer.company": "الشركة", "footer.trust": "الثقة", "footer.privacy": "الخصوصية", "footer.security": "الأمن", "footer.accessibility": "إمكانية الوصول", "footer.start": "ابدأ محادثة تنفيذية", "locale.label": "اللغة والمنطقة", "locale.auto": "تم اكتشاف اللغة الإقليمية تلقائيا", "locale.translated": "الترجمة الآلية مفعلة. تظل الإنجليزية النسخة المرجعية للمحتوى القانوني والمنظم.", "locale.restricted": "تظل هذه الصفحة القانونية أو المنظمة باللغة الإنجليزية المرجعية.", "advisor.ask": "اسأل Obserrian", "advisor.send": "إرسال", "advisor.working": "جار التحليل"
  },
  "hi-IN": {
    "nav.services": "सेवाएँ", "nav.applications": "एप्लिकेशन", "nav.academy": "अकादमी", "nav.industries": "उद्योग", "nav.trust": "विश्वास", "nav.about": "हमारे बारे में", "nav.speaking": "व्याख्यान", "nav.resources": "संसाधन", "nav.florida": "फ्लोरिडा प्रशिक्षण", "nav.contact": "संपर्क", "nav.talk": "Obserra से बात करें", "footer.company": "कंपनी", "footer.trust": "विश्वास", "footer.privacy": "गोपनीयता", "footer.security": "सुरक्षा", "footer.accessibility": "सुलभता", "locale.label": "भाषा और क्षेत्र", "locale.translated": "स्वचालित अनुवाद सक्रिय है। कानूनी और विनियमित सामग्री के लिए अंग्रेजी नियंत्रक संस्करण बनी रहती है।", "locale.restricted": "यह कानूनी या विनियमित पृष्ठ अधिकृत अंग्रेजी में ही रहता है।", "advisor.ask": "Obserrian से पूछें", "advisor.send": "भेजें", "advisor.working": "विश्लेषण"
  },
  "ja-JP": {
    "nav.services": "サービス", "nav.applications": "アプリケーション", "nav.academy": "アカデミー", "nav.industries": "業界", "nav.trust": "信頼", "nav.about": "会社情報", "nav.speaking": "講演", "nav.resources": "リソース", "nav.florida": "フロリダ研修", "nav.contact": "お問い合わせ", "nav.talk": "Obserra に相談", "nav.utility": "エンタープライズインテリジェンス · サイバーセキュリティ · AI ガバナンス · 保護インテリジェンス", "footer.company": "会社", "footer.trust": "信頼", "footer.privacy": "プライバシー", "footer.security": "セキュリティ", "footer.accessibility": "アクセシビリティ", "footer.start": "経営層向け相談を開始", "locale.label": "言語と地域", "locale.auto": "地域の言語を自動検出しました", "locale.translated": "自動翻訳が有効です。法務および規制対象の内容は英語が正式版です。", "locale.restricted": "この法務または規制対象ページは正式な英語版のまま表示されます。", "advisor.ask": "Obserrian に質問", "advisor.send": "送信", "advisor.working": "分析中"
  },
  "ko-KR": {
    "nav.services": "서비스", "nav.applications": "애플리케이션", "nav.academy": "아카데미", "nav.industries": "산업", "nav.trust": "신뢰", "nav.about": "회사 소개", "nav.speaking": "강연", "nav.resources": "자료", "nav.florida": "플로리다 교육", "nav.contact": "문의", "nav.talk": "Obserra와 상담", "footer.company": "회사", "footer.trust": "신뢰", "footer.privacy": "개인정보", "footer.security": "보안", "footer.accessibility": "접근성", "locale.label": "언어 및 지역", "locale.translated": "자동 번역이 활성화되었습니다. 법률 및 규제 콘텐츠는 영어가 기준 버전입니다.", "locale.restricted": "이 법률 또는 규제 페이지는 공식 영어로 유지됩니다.", "advisor.ask": "Obserrian에게 질문", "advisor.send": "보내기", "advisor.working": "분석 중"
  },
  "zh-CN": {
    "nav.services": "服务", "nav.applications": "应用", "nav.academy": "学院", "nav.industries": "行业", "nav.trust": "信任中心", "nav.about": "关于我们", "nav.speaking": "演讲", "nav.resources": "资源", "nav.florida": "佛罗里达培训", "nav.contact": "联系", "nav.talk": "与 Obserra 沟通", "nav.utility": "企业情报 · 网络安全 · AI 治理 · 保护情报", "footer.company": "公司", "footer.trust": "信任中心", "footer.privacy": "隐私", "footer.security": "安全", "footer.accessibility": "无障碍", "footer.start": "开始高管交流", "locale.label": "语言和地区", "locale.auto": "已自动检测地区语言", "locale.translated": "自动翻译已启用。法律及受监管内容仍以英文版本为准。", "locale.restricted": "此法律或受监管页面保留权威英文版本。", "advisor.ask": "询问 Obserrian", "advisor.send": "发送", "advisor.working": "分析中"
  },
};

const REGION_DEFAULTS: Record<string, ObserraLocale> = {
  GB: "en-GB", IE: "en-GB", AU: "en-GB", NZ: "en-GB",
  ES: "es-ES", MX: "es-419", AR: "es-419", BO: "es-419", CL: "es-419", CO: "es-419", CR: "es-419", DO: "es-419", EC: "es-419", GT: "es-419", HN: "es-419", NI: "es-419", PA: "es-419", PE: "es-419", PR: "es-419", PY: "es-419", SV: "es-419", UY: "es-419", VE: "es-419",
  FR: "fr-FR", MC: "fr-FR", LU: "fr-FR",
  DE: "de-DE", AT: "de-DE", CH: "de-DE",
  BR: "pt-BR", PT: "pt-PT",
  IT: "it-IT", NL: "nl-NL",
  AE: "ar", BH: "ar", DZ: "ar", EG: "ar", IQ: "ar", JO: "ar", KW: "ar", LB: "ar", LY: "ar", MA: "ar", OM: "ar", QA: "ar", SA: "ar", TN: "ar", YE: "ar",
  IN: "hi-IN", JP: "ja-JP", KR: "ko-KR", CN: "zh-CN", SG: "zh-CN",
};

const FULL_PAGE_TRANSLATION_BLOCKED_PREFIXES = [
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
  "/florida-security-training",
  "/trust/accessibility-statement",
  "/trust/privacy-policy",
  "/trust/security-and-responsible-disclosure",
  "/trust/terms-of-service",
] as const;

function cleanLocaleCandidate(value: string) {
  return value.trim().replace("_", "-").slice(0, 35);
}

export function isSupportedLocale(value: unknown): value is ObserraLocale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function matchSupportedLocale(value: string | null | undefined): ObserraLocale | null {
  if (!value) return null;
  const candidate = cleanLocaleCandidate(value);
  const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === candidate.toLowerCase());
  if (exact) return exact;

  const lower = candidate.toLowerCase();
  if (lower.startsWith("en-gb") || lower.startsWith("en-ie") || lower.startsWith("en-au") || lower.startsWith("en-nz")) return "en-GB";
  if (lower.startsWith("en")) return "en-US";
  if (lower.startsWith("es-es")) return "es-ES";
  if (lower.startsWith("es")) return "es-419";
  if (lower.startsWith("fr")) return "fr-FR";
  if (lower.startsWith("de")) return "de-DE";
  if (lower.startsWith("pt-br")) return "pt-BR";
  if (lower.startsWith("pt")) return "pt-PT";
  if (lower.startsWith("it")) return "it-IT";
  if (lower.startsWith("nl")) return "nl-NL";
  if (lower.startsWith("ar")) return "ar";
  if (lower.startsWith("hi")) return "hi-IN";
  if (lower.startsWith("ja")) return "ja-JP";
  if (lower.startsWith("ko")) return "ko-KR";
  if (lower.startsWith("zh")) return "zh-CN";
  return null;
}

export function localeFromAcceptLanguage(value: string | null | undefined): ObserraLocale | null {
  if (!value) return null;
  const ordered = value
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qValue = params.find((param) => param.trim().toLowerCase().startsWith("q="));
      const q = qValue ? Number.parseFloat(qValue.split("=")[1] ?? "0") : 1;
      return { tag, q: Number.isFinite(q) ? q : 0 };
    })
    .filter(({ tag, q }) => Boolean(tag) && q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ordered) {
    const matched = matchSupportedLocale(tag);
    if (matched) return matched;
  }
  return null;
}

export function recommendedLocale(input: {
  savedLocale?: string | null;
  acceptLanguage?: string | null;
  country?: string | null;
}): ObserraLocale {
  const saved = matchSupportedLocale(input.savedLocale);
  if (saved) return saved;
  const language = localeFromAcceptLanguage(input.acceptLanguage);
  if (language) return language;
  const country = input.country?.trim().toUpperCase();
  return (country && REGION_DEFAULTS[country]) || DEFAULT_LOCALE;
}

export function localeDirection(locale: ObserraLocale) {
  return LOCALE_OPTIONS.find((option) => option.locale === locale)?.direction ?? "ltr";
}

export function message(locale: ObserraLocale, key: LocalizedMessageKey) {
  return MESSAGE_OVERRIDES[locale]?.[key] ?? ENGLISH_MESSAGES[key];
}

export function isFullPageTranslationAllowed(pathname: string) {
  const clean = pathname.split("?")[0]?.split("#")[0] || "/";
  return !FULL_PAGE_TRANSLATION_BLOCKED_PREFIXES.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

export function isEnglishLocale(locale: ObserraLocale) {
  return locale === "en-US" || locale === "en-GB";
}
