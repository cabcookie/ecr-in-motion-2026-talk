/**
 * Das Vortragsfenster, ohne AWS geprüft.
 *
 *   pnpm --filter @ecr-talk/presentation fenster:test
 *
 * Ruft die Endpunkte des Backends direkt auf, so wie der Blocks-Handler es
 * täte. Belegt wird: Außerhalb des Fensters lehnt jeder Teilnehmer-Endpunkt
 * ab, ohne dass ein Modell anläuft oder etwas im Speicher landet. Nach
 * „Start jetzt" geht alles, zwei Stunden später wieder nicht.
 *
 * Das Backend legt seine lokalen Speicher relativ zum Arbeitsverzeichnis ab.
 * Der Test wechselt deshalb vorher in einen leeren Ordner, damit er weder die
 * Daten des Dev-Servers liest noch sie verändert.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FENSTER_DAUER_MS,
  fensterstand,
  heuteAbend,
  INAKTIV,
  istAktiv,
} from "../aws-blocks/fenster";

let fehler = 0;
function pruefe(bedingung: boolean, was: string) {
  console.log(`${bedingung ? "  ok  " : "  FEHLER  "} ${was}`);
  if (!bedingung) fehler++;
}

console.log("Rechnung");
const t0 = Date.UTC(2026, 8, 16, 16, 0);
pruefe(!istAktiv(null, t0), "ohne Start gesperrt");
pruefe(istAktiv(t0, t0), "ab dem Start offen");
pruefe(istAktiv(t0, t0 + FENSTER_DAUER_MS - 1), "kurz vor Ablauf noch offen");
pruefe(!istAktiv(t0, t0 + FENSTER_DAUER_MS), "nach zwei Stunden gesperrt");
pruefe(!istAktiv(t0, t0 - 1), "vor dem Start gesperrt");
pruefe(fensterstand(t0, t0).ende === t0 + FENSTER_DAUER_MS, "Ende = Start + 2 h");

/* 16.09.2026 ist Sommerzeit (UTC+2), 16.01.2026 Winterzeit (UTC+1). */
pruefe(heuteAbend(Date.UTC(2026, 8, 16, 9, 0)) === Date.UTC(2026, 8, 16, 16, 0), "18:00 im Sommer = 16:00 UTC");
pruefe(heuteAbend(Date.UTC(2026, 0, 16, 9, 0)) === Date.UTC(2026, 0, 16, 17, 0), "18:00 im Winter = 17:00 UTC");
/* 23:30 UTC am 16.09. ist in Berlin schon der 17.09. */
pruefe(
  heuteAbend(Date.UTC(2026, 8, 16, 23, 30)) === Date.UTC(2026, 8, 17, 16, 0),
  "„heute“ ist der Kalendertag in Berlin, nicht in UTC",
);

/*
  Belegt wird am Speicher: Das Backend legt lokal jede Ablage als Datei unter
  .bb-data ab, und ein Agentenlauf schreibt dort als Erstes Gespräch und
  Verlauf. Bleibt der Ordner über alle gesperrten Aufrufe hinweg Byte für
  Byte gleich, ist weder geschrieben noch ein Modell angestoßen worden.
*/
function abbild(wurzel: string): string {
  if (!existsSync(wurzel)) return "";
  const teile: string[] = [];
  const lauf = (ordner: string) => {
    for (const eintrag of readdirSync(ordner, { withFileTypes: true }).sort((x, y) => x.name.localeCompare(y.name))) {
      const pfad = join(ordner, eintrag.name);
      if (eintrag.isDirectory()) lauf(pfad);
      else teile.push(`${pfad}:${createHash("sha256").update(readFileSync(pfad)).digest("hex")}`);
    }
  };
  lauf(wurzel);
  return teile.join("\n");
}

const ordner = mkdtempSync(join(tmpdir(), "fenster-test-"));
const vorher = process.cwd();
process.chdir(ordner);
delete process.env.DECK_TOKEN;

try {
  const { api } = await import("../aws-blocks/index");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = (api as any)({}) as Record<string, (...args: any[]) => Promise<any>>;

  const abgelehnt = async (aufruf: () => Promise<unknown>) => {
    try {
      await aufruf();
      return false;
    } catch (e) {
      return (e as Error).message === INAKTIV;
    }
  };

  console.log("\nAußerhalb des Fensters");
  const stand = await a.vortragsfenster();
  pruefe(stand.aktiv === false && stand.start === null, "frisches Backend ist gesperrt");

  const gesperrt: Record<string, () => Promise<unknown>> = {
    submitAnswer: () => a.submitAnswer("umfrage", "handy-1", "ja"),
    myAnswers: () => a.myAnswers("handy-1"),
    answersFor: () => a.answersFor("umfrage"),
    subscribeAnswers: () => a.subscribeAnswers(),
    chatStart: () => a.chatStart("handy-1", "voll"),
    chatSend: () => a.chatSend("gespraech", "Hallo Lisa", "kanal", "handy-1", "voll"),
    chatSendRoh: () => a.chatSend("gespraech", "Hallo", "kanal", "handy-1", "roh"),
    chatHistory: () => a.chatHistory("gespraech", "voll"),
    chatChannel: () => a.chatChannel("kanal", "voll"),
    mailEingang: () =>
      a.mailEingang("", {
        absender: "jemand@example.com",
        betreff: "Hallo",
        text: "Bitte antworten",
        postfach: "ecr2026@carstenbkoch.de",
      }),
    lisaFragen: () => a.lisaFragen(),
    lisaKanal: () => a.lisaKanal(),
  };
  const vorAufrufen = abbild(".bb-data");
  for (const [name, aufruf] of Object.entries(gesperrt)) {
    pruefe(await abgelehnt(aufruf), `${name} lehnt ab`);
  }

  /*
    Jeder Endpunkt muss hier eingeordnet sein. Kommt ein neuer dazu, schlägt
    der Test an, bis jemand entschieden hat, ob er offen bleiben darf.
  */
  const offen = ["subscribeDeck", "currentSlide", "controlStatus", "zeitplanLesen", "subscribeReset", "vortragsfenster"];
  const geschuetzt = ["gotoSlide", "resetEingaben", "zeitplanSchreiben", "zeitplanVerwerfen", "lisaAntwortet", "fensterOeffnen"];
  const bekannt = new Set([...Object.keys(gesperrt), ...offen, ...geschuetzt]);
  const unbekannt = Object.keys(a).filter((k) => !bekannt.has(k));
  pruefe(unbekannt.length === 0, `jeder Endpunkt ist eingeordnet${unbekannt.length ? ` (fehlt: ${unbekannt.join(", ")})` : ""}`);

  pruefe(abbild(".bb-data") === vorAufrufen, "kein Schreibzugriff, kein Agentenlauf (Speicher unverändert)");

  console.log("\nIm Fenster");
  const offenStand = await a.fensterOeffnen("jetzt", "");
  pruefe(offenStand.aktiv === true, "„Start jetzt“ öffnet sofort");
  pruefe((await a.vortragsfenster()).aktiv === true, "der Stand ist gespeichert");
  /*
    Erst jetzt lesen: Hätte der gesperrte submitAnswer geschrieben, stünde
    die Antwort hier.
  */
  pruefe((await a.answersFor("umfrage")).length === 0, "der gesperrte Aufruf hat nichts geschrieben");
  pruefe((await a.lisaFragen()).offen.length === 0, "keine Frage an Lisa liegt ab");
  const vorAntwort = abbild(".bb-data");
  await a.submitAnswer("umfrage", "handy-1", "ja");
  pruefe((await a.answersFor("umfrage")).length === 1, "im Fenster wird die Antwort gespeichert");
  /* Gegenprobe: Ein echter Schreibzugriff verändert das Abbild. Sonst bewiese der Vergleich oben nichts. */
  pruefe(abbild(".bb-data") !== vorAntwort, "Gegenprobe: ein Schreibzugriff ist im Abbild sichtbar");
  pruefe(!(await abgelehnt(() => a.chatStart("handy-1", "voll"))), "chatStart geht");

  console.log("\nGrenzen");
  const zuLang = async (aufruf: () => Promise<unknown>) => {
    try {
      await aufruf();
      return false;
    } catch (e) {
      return /länger als/.test((e as Error).message);
    }
  };
  pruefe(await zuLang(() => a.submitAnswer("umfrage", "handy-1", "x".repeat(501))), "Antwort über 500 Zeichen abgelehnt");
  const vorZuLang = abbild(".bb-data");
  pruefe(await zuLang(() => a.chatSend("g", "x".repeat(2001), "k", "handy-1", "voll")), "Nachricht über 2000 Zeichen abgelehnt");
  pruefe(abbild(".bb-data") === vorZuLang, "die zu lange Nachricht startet keinen Agenten");
  pruefe(
    await (async () => {
      try {
        await a.chatStart("handy-1", "constructor");
        return false;
      } catch (e) {
        return /Unbekannte Stufe/.test((e as Error).message);
      }
    })(),
    "unbekannte Chatstufe abgelehnt",
  );

  console.log("\nNach Ablauf");
  const echtesJetzt = Date.now;
  Date.now = () => echtesJetzt() + FENSTER_DAUER_MS + 10_000;
  try {
    pruefe((await a.vortragsfenster()).aktiv === false, "zwei Stunden später von selbst gesperrt");
    pruefe(await abgelehnt(() => a.submitAnswer("umfrage", "handy-1", "nein")), "submitAnswer lehnt wieder ab");
  } finally {
    Date.now = echtesJetzt;
  }
} finally {
  process.chdir(vorher);
  /* Nur den eigenen Ordner, und nur wenn er nach Testdaten aussieht. */
  if (readdirSync(ordner).every((n) => n === ".bb-data")) rmSync(ordner, { recursive: true, force: true });
}

console.log(fehler ? `\n${fehler} Fehler.` : "\nAlles grün.");
process.exit(fehler ? 1 : 0);
