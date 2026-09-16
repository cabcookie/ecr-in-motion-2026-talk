import PostalMime from "postal-mime";
import type { Akte } from "../agent/akte";
import type { Brief } from "../agent/antwort";

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
  kategorie_ziele: "Kategorieplan — Ziele des Geschäftsjahrs",
};

const GRUENDE: Record<string, string> = {
  nicht_gefunden: "Dazu liegt dort nichts vor.",
  nicht_zustaendig: "Dafür ist diese Kategorie nicht zuständig.",
  unvollstaendig: "Die Anfrage war für dieses System nicht vollständig genug.",
  nicht_erreichbar: "Das System hat nicht geantwortet.",
};

/**
 * Was dabei herauskam — in einem Satz, und ohne Werte.
 *
 * Diese Zeilen gehen an den ABSENDER, also an einen Lieferanten, mit dem wir
 * verhandeln. Er darf erfahren, OB eine Bedingung erfüllt ist; er darf nicht
 * erfahren, MIT WELCHEM WERT. Ein Rohertrag von 36,0 %, die Belegung des
 * Regals oder der Name des Artikels, der weichen müsste, sind genau die
 * Angaben, die in der Verhandlung gegen uns arbeiten.
 *
 * Deshalb wird hier nicht das Ergebnis wiedergegeben, sondern sein Befund. Der
 * Agent hält sich im Brief an dieselbe Regel; diese Fusszeile dürfte sie nicht
 * unterlaufen.
 */
function ergebnisSatz(system: string, e: Record<string, unknown>): string {
  if (e.verfuegbar === false) {
    return GRUENDE[String(e.grund)] ?? "Dieses System konnte nichts beitragen.";
  }

  switch (system) {
    case "kalkulation_marge":
      return e.erfuellt
        ? "Die Kalkulation erfüllt unsere Kategorievorgabe."
        : "Die Kalkulation erfüllt unsere Kategorievorgabe nicht.";

    case "regalplanung_platz":
      return Number(e.facingsFrei) > 0
        ? "In der betreffenden Regalzone ist noch Platz."
        : "Die betreffende Regalzone ist voll — eine Neulistung setzt eine Auslistung voraus.";

    case "warenwirtschaft_kategorie":
      return String(e.entwicklung ?? "").trimStart().startsWith("-")
        ? "Die Kategorie entwickelt sich insgesamt rückläufig."
        : "Die Kategorie entwickelt sich insgesamt positiv.";

    case "warenwirtschaft_artikel":
      return "Der Artikelstamm dieser Kategorie wurde geprüft.";

    case "marktdaten_segment":
      return `Das Produkt fällt ins Segment „${String(e.segment ?? "—")}“; dessen Entwicklung im Markt ist mir bekannt.`;

    case "aktionskalender_zeitraum":
      return e.fristErfuellt
        ? Array.isArray(e.freieFlaechen) && e.freieFlaechen.length > 0
          ? "Der Wunschtermin hält unsere Vorlauffrist, und es gibt freie Aktionsflächen in seiner Nähe."
          : "Der Wunschtermin hält unsere Vorlauffrist."
        : "Der Wunschtermin unterschreitet unsere Vorlauffrist für Aktionsflächen.";

    case "listung_anforderungen":
      return `Der Listungsweg dieser Kategorie hat ${Array.isArray(e.tore) ? e.tore.length : "mehrere"} Tore; ich habe geprüft, welche davon greifen.`;

    case "kategorie_ziele":
      return `Abgeglichen mit unserem Kategorieplan ${String(e.geschaeftsjahr ?? "")} — er legt fest, welche Käufergruppen wir halten und welche wir ausbauen.`;

    default:
      return "Abgefragt und in die Bewertung eingerechnet.";
  }
}

/**
 * Die ursprüngliche Nachricht, eingerückt wie in jedem Mailprogramm.
 *
 * Wer eine Antwort bekommt, will sehen, worauf sie sich bezieht — besonders
 * wenn zwischen Anfrage und Antwort Stunden liegen oder man mehrere Anfragen
 * geschickt hat.
 */
function zitat(eingang: { absenderName?: string; absender: string; text: string }): string[] {
  const wer = eingang.absenderName ? `${eingang.absenderName} <${eingang.absender}>` : eingang.absender;
  const zeilen = eingang.text.trim().split("\n");
  /* Eine sehr lange Mail nicht vollständig spiegeln — der Bezug reicht. */
  const gekuerzt = zeilen.length > 40 ? [...zeilen.slice(0, 40), "…"] : zeilen;
  return [`Am ${heute()} schrieb ${wer}:`, "", ...gekuerzt.map((z) => (z ? `> ${z}` : ">"))];
}

function heute(): string {
  return new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Der Brief, wie er hinausgeht — ohne den festen Anhang.
 *
 * Unter der Antwort des Agenten steht, was er dafür getan hat — das ist der
 * Beleg, den Abschnitt 6 verspricht, und zugleich die Nachvollziehbarkeit, die
 * der Abschnitt zum EU AI Act fordert. Dass eine Maschine geantwortet hat,
 * steht ebenfalls dort und nicht im Kleingedruckten.
 *
 * Der Brief kommt in Teilen vom Werkzeug `antworte_per_mail`, und die
 * Unterschrift setzt dieser Code, nicht das Modell. So steht unter jeder Mail
 * derselbe Name, und eine Vorrede („Ich habe alle Systemabfragen
 * abgeschlossen …") hat keinen Platz, an dem sie landen könnte.
 */
export function baueRumpf(brief: Brief, akte: Akte): string {
  const teile = [
    brief.anrede.trim(),
    "",
    brief.text.trim(),
    "",
    brief.grussformel.trim(),
    "Lisa Berger",
    "",
    "— — —",
    "",
  ];

  if (akte.schritte.length > 0) {
    teile.push("Was ich dafür abgefragt habe, und warum:", "");
    /*
      Die Begründung stammt vom Agenten selbst, gegeben BEVOR er das Ergebnis
      kannte. Fehlt sie, bleibt der Systemname allein stehen, statt dass hier
      eine erfunden wird.
    */
    akte.schritte.forEach((schritt, i) => {
      teile.push(`  ${i + 1}. ${SYSTEMNAMEN[schritt.system] ?? schritt.system}`);
      if (schritt.warum?.trim()) teile.push(`     ${schritt.warum.trim()}`);
      teile.push(`     → ${ergebnisSatz(schritt.system, schritt.ergebnis)}`, "");
    });
    teile.pop();
  } else {
    teile.push("Ich habe für diese Antwort kein System abgefragt.");
  }

  /*
    Dass eine interne Rückfrage läuft, darf der Absender wissen — WAS gefragt
    wurde, nicht. Deshalb steht hier eine Zahl und kein Wortlaut.
  */
  if (akte.fragen.length > 0) {
    teile.push(
      "",
      akte.fragen.length === 1
        ? "Zu einem Punkt habe ich eine interne Rückfrage angestoßen."
        : `Zu ${akte.fragen.length} Punkten habe ich interne Rückfragen angestoßen.`,
    );
  }

  teile.push(
    "",
    "Die Systeme dahinter sind für diesen Abend simuliert. Die Arbeit des",
    "Agenten ist es nicht: Welche Systeme er befragt und was er daraus",
    "schließt, entscheidet er selbst.",
  );

  return teile.join("\n");
}

/**
 * Hängt den festen Teil und das Zitat an.
 *
 * Getrennt vom Rumpf, weil beides an verschiedenen Orten entsteht: Den Rumpf
 * baut der Agent in AgentCore, denn nur dort liegt die Akte. Anhang und Zitat
 * setzt die Mail-Lambda davor, denn nur neben ihr liegt anhang.md.
 */
export function mitAnhang(
  rumpf: string,
  anhang: string,
  eingang?: { absenderName?: string; absender: string; text: string },
): string {
  /*
    Der feste Teil steht in anhang.md und wird WORTWOERTLICH angehaengt. Es ist
    Text fuer einen Empfaenger, kein Programm: Wer ihn aendern will, oeffnet
    eine Textdatei und sieht genau das, was ankommt.
  */
  const teile = [rumpf.trimEnd(), "", "— — —", "", anhang];

  /*
    Das Zitat ganz zum Schluss — nach dem Anhang, nicht davor. So macht es
    jedes Mailprogramm: Das Zitat ist Gedaechtnisstuetze, nicht Inhalt. Stand
    es davor, schob es den nuetzlichen Teil unter die eigene alte Mail — und
    dort sucht ihn niemand.
  */
  if (eingang?.text?.trim()) {
    teile.push("", "— — —", "", ...zitat(eingang));
  }

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
