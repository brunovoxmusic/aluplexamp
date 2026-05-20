import translationsJson from "@/content/translations.json";

export type Language = "sk" | "en" | "de";

export type Translations = Record<Language, Record<string, string>>;

export const translations = translationsJson as Translations;
