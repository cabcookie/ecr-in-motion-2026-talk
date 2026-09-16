import { SECTIONS } from "./data";
import type { MailMock } from "./types";

/**
 * Was der Agent aus den Foliendaten bekommt.
 *
 * Beides steht schon auf den Folien: der Systemprompt in Abschnitt 16, die
 * Mail von Hallbach in Abschnitt 2. Hier wird es nur herausgezogen, statt
 * ein zweites Mal geschrieben zu werden — sonst läuft der Agent irgendwann
 * mit einem anderen Prompt als dem, den das Publikum auf dem Handy aufklappt.
 */

function findChat(id: string) {
  for (const section of SECTIONS) {
    for (const panel of section.panels) {
      const a = panel.audience;
      if (a?.kind === "chat" && a.id === id) return a;
    }
  }
  throw new Error(`Kein Chat mit der Kennung "${id}" in den Foliendaten.`);
}

function findMail(subjectContains: string): MailMock {
  for (const section of SECTIONS) {
    for (const panel of section.panels) {
      const m = panel.mock;
      if (m?.t === "mail" && !m.sent && m.subject.includes(subjectContains)) return m;
    }
  }
  throw new Error(`Keine eingehende Mail mit "${subjectContains}" im Betreff.`);
}

/** Kennung des Chats aus Abschnitt 16. */
export const CHAT_ID = "systemprompt-chat";

/** Der Systemprompt, mit dem der Agent läuft — derselbe, den das Publikum sieht. */
export const SYSTEM_PROMPT = findChat(CHAT_ID).systemPrompt;

/** Die eingehende Mail, mit der das Gespräch beginnt. */
export const SEED_MAIL = findMail("Crispy Bites");

/**
 * Die Mail als Text für das Modell. Bewusst im Format eines weitergeleiteten
 * Postfacheintrags: der Agent soll sie einordnen, nicht eine Frage beantworten.
 */
export const SEED_MESSAGE = [
  `Von: ${SEED_MAIL.from}`,
  `An: ${SEED_MAIL.to}`,
  `Betreff: ${SEED_MAIL.subject}`,
  "",
  ...SEED_MAIL.body,
  ...(SEED_MAIL.facts?.length
    ? ["", ...SEED_MAIL.facts.map(([k, v]) => `${k}: ${v}`)]
    : []),
].join("\n");

/**
 * Die Trennmarke zwischen Arbeitsweg und Antwort.
 *
 * Steht hier, weil beide Seiten sie brauchen: Der Agent setzt sie, die App
 * teilt daran. Zwei Schreibweisen an zwei Orten gingen beim ersten Umbenennen
 * auseinander, und dann stünde der ganze Gedankengang als Antwort im Chat.
 */
export const ANTWORT_MARKE = "===ANTWORT===";
