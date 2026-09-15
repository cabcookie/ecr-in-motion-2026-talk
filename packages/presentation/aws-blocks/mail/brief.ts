import PostalMime from "postal-mime";
import { CODE_URL, VORTRAG_URL, type Modus } from "./konfig";
import type { Lauf } from "./agent";

/** Was wir aus einer eingegangenen Mail brauchen. */
export interface Eingang {
  readonly absender: string;
  readonly absenderName?: string;
  readonly betreff: string;
  readonly text: string;
  readonly messageId?: string;
}

export async function lies(roh: Uint8Array): Promise<Eingang> {
  const mail = await PostalMime.parse(roh);
  const von = mail.from;
  return {
    absender: von?.address ?? "",
    absenderName: von?.name || undefined,
    betreff: mail.subject ?? "(ohne Betreff)",
    // Reiner Text, wenn vorhanden; sonst das HTML entkleidet. Die Teilnehmer
    // schreiben aus ihrem eigenen Mailprogramm, und manche schicken nur HTML.
    text: (mail.text ?? entkleide(mail.html ?? "")).trim(),
    messageId: mail.messageId ?? undefined,
  };
}

/** Reicht für Signaturen und einfache Absätze — wir brauchen keinen Browser. */
function entkleide(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n");
}

const SYSTEMNAMEN: Record<string, string> = {
  warenwirtschaft_kategorie: "Warenwirtschaft — Kategorieentwicklung",
  marktdaten_segment: "Marktdaten — Segment",
  regalplanung_platz: "Regalplanung — Platzprüfung",
  kalkulation_marge: "Kalkulation — Marge",
  warenwirtschaft_artikel: "Warenwirtschaft — Artikelstamm",
  aktionskalender_zeitraum: "Aktionskalender — freie Flächen",
  listung_anforderungen: "Kategorieakte — Listungsweg",
};

/**
 * Die Antwortmail.
 *
 * Unter der Antwort des Agenten steht, was er dafür getan hat — das ist der
 * Beleg, den Abschnitt 6 verspricht, und zugleich die Nachvollziehbarkeit, die
 * Abschnitt 24 vom EU AI Act her fordert. Dass eine Maschine geantwortet hat,
 * steht ebenfalls dort und nicht im Kleingedruckten.
 */
export function baueAntwort(modus: Modus, lauf: Lauf): string {
  const teile = [lauf.text.trim(), ""];

  if (modus === "assistent") {
    teile.push("— — —", "");
    if (lauf.schritte.length > 0) {
      teile.push("Was ich dafür abgefragt habe:");
      lauf.schritte.forEach((s, i) =>
        teile.push(`  ${i + 1}. ${SYSTEMNAMEN[s] ?? s}`),
      );
    } else {
      teile.push("Ich habe für diese Antwort kein System abgefragt.");
    }

    /*
      Dass eine interne Rückfrage läuft, darf der Absender wissen — WAS gefragt
      wurde, nicht. Deshalb steht hier eine Zahl und kein Wortlaut: Die Fragen
      an Lisa sind der einzige Teil des Laufs, der diese Mail nicht verlässt.
    */
    if (lauf.fragenAnLisa.length > 0) {
      teile.push(
        "",
        lauf.fragenAnLisa.length === 1
          ? "Zu einem Punkt habe ich eine interne Rückfrage angestoßen."
          : `Zu ${lauf.fragenAnLisa.length} Punkten habe ich interne Rückfragen angestoßen.`,
      );
    }

    teile.push(
      "",
      "Die Systeme dahinter sind für diesen Abend simuliert. Die Arbeit des",
      "Agenten ist es nicht: Welche Systeme er befragt und was er daraus",
      "schließt, entscheidet er selbst.",
    );
  }

  teile.push(
    "",
    "— — —",
    "",
    "Diese Antwort kommt von einem KI-Agenten, nicht von einem Menschen.",
    "",
    `Der Vortrag zum Mitklicken:  ${VORTRAG_URL}`,
    `Der Quelltext dazu:          ${CODE_URL}`,
    /*
      Hier standen zwei Belege gegen die Massenarbeitslosigkeit. Sie sind raus:
      Die Links fuehrten nur auf die Startseiten der beiden Aemter, nicht auf
      die Tabellen. Ein Beleg, den der Empfaenger selbst suchen muss, ist
      keiner — und in einer Mail, die ohnehin von der Sache handelt, war der
      Exkurs auch deplatziert.
    */
    "",
    "Ihre E-Mail-Adresse wurde nur für diese eine Antwort verwendet und ist",
    "damit gelöscht.",
  );

  return teile.join("\n");
}

/** RFC 2047 für Kopfzeilen mit Umlauten. */
function kopf(text: string): string {
  if (/^[\x20-\x7E]*$/.test(text)) return text;
  return `=?UTF-8?B?${Buffer.from(text, "utf8").toString("base64")}?=`;
}

export interface AusgangProps {
  readonly von: string;
  readonly vonName: string;
  readonly an: string;
  readonly betreff: string;
  readonly text: string;
  readonly inAntwortAuf?: string;
}

/**
 * Baut die Rohmail.
 *
 * Wir bauen sie selbst, statt SES einen Betreff und einen Text zu geben, weil
 * nur so In-Reply-To und References gesetzt werden können. Ohne die erscheint
 * die Antwort im Postfach der Teilnehmer als neue Nachricht statt im selben
 * Gesprächsfaden — und der Moment, in dem die Antwort unter der eigenen Mail
 * auftaucht, ist die halbe Wirkung.
 */
export function baueRohmail(p: AusgangProps): string {
  const betreff = p.betreff.toLowerCase().startsWith("re:") ? p.betreff : `Re: ${p.betreff}`;
  const zeilen = [
    `From: ${kopf(p.vonName)} <${p.von}>`,
    `To: <${p.an}>`,
    `Subject: ${kopf(betreff)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "Auto-Submitted: auto-replied",
  ];
  if (p.inAntwortAuf) {
    zeilen.push(`In-Reply-To: ${p.inAntwortAuf}`, `References: ${p.inAntwortAuf}`);
  }
  // Base64 in Zeilen zu 76 Zeichen, so will es RFC 2045.
  const rumpf = Buffer.from(p.text, "utf8").toString("base64").replace(/(.{76})/g, "$1\r\n");
  return `${zeilen.join("\r\n")}\r\n\r\n${rumpf}\r\n`;
}
