/**
 * Der Agent. Einer.
 *
 * Bis zum 15.09. waren es zwei: eine selbstgeschriebene Werkzeugschleife für
 * den Mailweg und der Blocks-Agent für den Handy-Chat. Zwei Prompts, zwei
 * Modelle, zwei Konfigurationen — und als das Modell wechselte, zerbrach genau
 * der eine, den kein Test berührte.
 *
 * Jetzt gibt es eine Definition. Was die beiden Eingangswege unterscheidet,
 * ist ausschließlich, **womit der Agent antworten kann**:
 *
 *   Postfach  →  antworte_per_mail (Entwurf, Mensch bestätigt) + frage_das_team
 *   Chat      →  antworte_im_chat
 *
 * Alles andere — Modell, Systemprompt, die sechs Fachwerkzeuge, die Grenzen —
 * ist geteilt. Wer den Agenten ändern will, ändert ihn an einer Stelle.
 */
import { Agent, BedrockModels, type Scope } from '@aws-blocks/blocks';
import { SYSTEM_PROMPT } from '../../src/slides/agent';
import {
  antworteImChat,
  antworteVerMail,
  frageLisa,
  vorgangskontext,
  type Fragenablage,
  type Versand,
} from './antwort';
import { fachwerkzeuge } from './werkzeuge';

/**
 * Was für beide gilt.
 *
 * `SMART` ist Opus 4.8 — dasselbe Modell auf beiden Wegen. Bis hierher war das
 * eine Behauptung im Kommentar; jetzt ist es eine Zeile, die beide lesen.
 *
 * `FAST` (Haiku) bleibt als Rückfall: Wenn am Vortragsabend achtzig Handys
 * gleichzeitig schreiben und Opus drosselt, ist eine schnellere Antwort besser
 * als keine.
 */
const GEMEINSAM = {
  model: {
    deployed: [BedrockModels.SMART, BedrockModels.FAST],
    /*
      Lokal DASSELBE Modell wie ausgerollt.

      Ohne diesen Eintrag fällt der Block auf seinen eingebauten
      Attrappen-Provider zurück und antwortet „This is a canned mock response".
      Für eine Probe ist das wertlos: Man prüft dann Streaming und Verlauf, aber
      nie, was der Agent tatsächlich sagt.

      Der Attrappen-Provider bleibt als letzter Rückfall dahinter — wer ohne
      AWS-Zugangsdaten entwickelt, bekommt weiterhin etwas zu sehen. Der
      Dev-Server braucht dafür AWS_PROFILE=ecrtag in seiner Umgebung, sonst
      scheitert Bedrock still und die Attrappe übernimmt wieder.
    */
    local: [BedrockModels.SMART],
  },
  systemPrompt: SYSTEM_PROMPT,
  toolContextSchema: vorgangskontext,
  streamingMode: 'token' as const,
  /** Ein Saal voller Handys — der Verlauf soll nicht unbegrenzt mitwachsen. */
  conversation: { strategy: 'sliding-window' as const, windowSize: 20 },
  /*
    Sieben Fachwerkzeuge, ein Antwortwerkzeug, dazu Runden zum Nachdenken.
    Großzügiger als beim alten Mail-Agenten (dort acht), weil eine Rückfrage an
    Lisa mitten im Zug liegt und das Budget über die Unterbrechung hinweg
    weiterzählt — ein zu enger Deckel würde den Vorgang nach ihrer Antwort
    abwürgen.
  */
  maxLlmCalls: 14,
  maxToolIterations: 20,
};

/**
 * Der Agent hinter dem Postfach.
 *
 * Kurze Kennung mit Absicht: Der Name des S3-Buckets für die Sitzungsstände
 * wird aus Stack- und Blockkennung zusammengesetzt und darf 63 Zeichen nicht
 * überschreiten.
 */
export function postfachAgent(
  scope: Scope,
  kennung: string,
  versende: Versand,
  lege: Fragenablage,
  /*
    Ob der Agent die Systeme der Handelswelt befragen darf.

    Das ist der ganze Unterschied zwischen den beiden Postfächern — und der
    Kern von Abschnitt 15. Derselbe Agent, derselbe Systemprompt, dieselben
    Grenzen; ihm fehlen nur die Werkzeuge. Dann KANN er nichts nachschlagen und
    muss fragen.

    Vorher war der Vergleich schwächer und angreifbar: Das zweite Postfach hatte
    einen ANDEREN Prompt, der ausdrücklich zum Raten aufforderte. Wer das merkt,
    hat die Folie widerlegt.
  */
  mitFachwerkzeugen: boolean,
): Agent<any> {
  return new Agent(scope, kennung, {
    ...GEMEINSAM,
    tools: (tool) => ({
      ...(mitFachwerkzeugen ? fachwerkzeuge(tool) : {}),
      antworte_per_mail: antworteVerMail(tool, versende),
      frage_das_team: frageLisa(tool, lege),
    }),
  });
}

/**
 * Derselbe Agent, im Chat.
 *
 * Er antwortet über `antworte_im_chat`, und das ist die saubere Trennung: Was
 * ins Werkzeug geht, ist die Antwort; alles, was er daneben schreibt, ist sein
 * Arbeitsweg. Keine Marke im Text, an die er sich halten muss.
 *
 * Ein Zwischenstand hatte es mit einer Trennmarke im Fließtext versucht. Das
 * funktionierte, sprang aber: Solange die Marke nicht angekommen war, hielt die
 * App den laufenden Text für die Antwort und ordnete ihn danach um. Der
 * Werkzeugaufruf kommt als eigenes Ereignis — die Antwort erscheint auf einmal
 * und an der richtigen Stelle.
 */
export function chatAgent(scope: Scope): Agent<any> {
  return new Agent(scope, 'berater', {
    ...GEMEINSAM,
    systemPrompt:
      `${SYSTEM_PROMPT}\n\n` +
      'Du antwortest hier im Chat, nicht per Mail. Dein Gegenüber gehört zum Category-Team, ' +
      'also zum eigenen Haus: Zahlen aus unseren Systemen sind ihm gegenüber keine Interna, ' +
      'sondern genau das, wofür es dich fragt. Nenne sie mit Quelle und Stand.\n\n' +
      'Schreibe ruhig mit, was du gerade tust und worauf du hinauswillst — das ist dein ' +
      'Arbeitsweg und wird getrennt angezeigt. Deine eigentliche Antwort gibst du ' +
      'ausschliesslich mit dem Werkzeug antworte_im_chat, ohne sie vorher anzukuendigen. ' +
      'Nur was dort steht, bekommt dein Gegenüber zu lesen.',
    tools: (tool) => ({
      ...fachwerkzeuge(tool),
      antworte_im_chat: antworteImChat(tool),
    }),
  });
}

/**
 * Der Agent auf der untersten Stufe: das nackte Modell.
 *
 * Kein Systemprompt, keine Fachwerkzeuge — nur die Trainingsdaten. Das ist der
 * hochmotivierte Abiturient aus Abschnitt 14: klug, schnell, hilfsbereit, und
 * er war noch nie in diesem Unternehmen. Er wird trotzdem antworten, und die
 * Zahlen darin wird er erfinden.
 *
 * Und er bekommt GAR KEIN Werkzeug, auch keines zum Antworten. Sein Text ist
 * die Antwort, unmittelbar. Mit einem Antwortwerkzeug schrieb er den Brief
 * hinein und danach noch einen Satz darüber — und im Chat erschien nicht der
 * Brief, sondern „Ich habe dem Lieferanten geantwortet: …". Dieselbe Falle wie
 * im Mailweg, hier aber ohne Nutzen: Es gibt nichts zu trennen, wenn alles, was
 * er sagt, ohnehin direkt beim Gegenüber landet.
 */
export function rohChatAgent(scope: Scope): Agent<any> {
  return new Agent(scope, 'roh', {
    ...GEMEINSAM,
    /*
      Derselbe Prompt, mit dem der Probe-Mailweg gemessen wurde.

      „Du bist ein hilfsbereiter Assistent" reichte nicht: Opus 4.8 antwortete
      damit ehrlich — „Ich bin ein KI-Assistent und habe keinen Zugriff" — und
      genau das ist NICHT die Vorführung. Der Abschnitt will zeigen, was
      passiert, wenn ein Modell trotzdem antwortet. Der Satz „Frage auch nicht
      nach" ist deshalb kein Beiwerk, sondern der Auslöser.

      Das ist eine ehrliche Vorführung und kein Trick: Genau so verhalten sich
      Assistenten, die man ohne Werkzeuge in einen Arbeitsablauf hängt und zum
      Antworten verpflichtet.
    */
    /*
      Der kuerzeste Prompt, der noch funktioniert.

      „Frag nicht nach" ist der Ausloeser: Ohne ihn antwortet Opus 4.8 ehrlich,
      dass es keinen Zugriff habe — und die Vorfuehrung waere hin. Fachlicher
      Kontext braucht es dafuer keinen; er antwortet auch ohne zu wissen, worum
      es geht.

      Was danach kommt, ist reine Darstellung und kein Fachkontext: ohne den
      Hinweis auf Fliesstext schreibt das Modell Markdown, und der Chat zeigt
      die Sternchen roh an. Und ohne die Aufforderung mitzuschreiben gibt es
      nichts aufzuklappen — dabei ist gerade hier interessant, WORAUF er seine
      erfundenen Zahlen stuetzt.
    */
    systemPrompt:
      'Du beantwortest Anfragen. Frag nicht nach — beantworte die Anfrage mit dem, was du hast.\n\n' +
      'Halte dich kurz, es wird auf einem Handy gelesen. Reiner Fliesstext, kein Markdown.\n\n' +
      'Schreibe zuerst in zwei, drei Saetzen, wie du zu deiner Einschaetzung kommst und worauf ' +
      'du dich dabei stuetzt. Deine Antwort gibst du dann mit dem Werkzeug antworte_im_chat — ' +
      'ohne sie vorher anzukuendigen.',
    tools: (tool) => ({
      antworte_im_chat: antworteImChat(tool, false),
    }),
  });
}

export { vorgangskontext, type Fragenablage, type Versand } from './antwort';
