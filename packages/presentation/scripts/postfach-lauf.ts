/**
 * Der Postfach-Agent, lokal und in einem Prozess — für Messungen und Proben.
 *
 * Derselbe Agent wie hinter ecr2026@ (aws-blocks/agent), nur der Versand ist
 * eine Attrappe, die den Brief festhält, statt ihn der Mail-Lambda zu geben.
 * Das Modell ist echt: Der Blocks-Agent läuft lokal gegen Bedrock, sobald
 * AWS-Zugangsdaten da sind.
 *
 *   AWS_PROFILE=ecrtag pnpm --filter @ecr-talk/presentation exec tsx scripts/postfach-lauf.ts
 *
 * Ohne Argumente beantwortet er die Hallbach-Mail aus den Folien und druckt,
 * was hinausginge.
 */
import { Scope } from '@aws-blocks/blocks';
import { postfachAgent, type Werkzeugauswahl } from '../aws-blocks/agent';
import type { Akte } from '../aws-blocks/agent/akte';
import type { Brief } from '../aws-blocks/agent/antwort';
import { baueRumpf } from '../aws-blocks/mail/brief';
import { POSTFAECHER } from '../aws-blocks/mail/konfig';
import { SEED_MAIL } from '../src/slides/agent';

export interface Postfachlauf {
  /** Was der Agent dem Sendewerkzeug übergab. Fehlt, wenn er nie gesendet hat. */
  readonly brief?: Brief;
  /** Brief samt Begründungsfusszeile, wie er an die Mail-Lambda ginge. */
  readonly rumpf?: string;
  readonly akte?: Akte;
  readonly fragen: { frage: string; warum: string }[];
  readonly dauerMs: number;
}

const scope = new Scope('postfach-lauf');
/*
  Blocks verlangt je Agent eine eigene Kennung im Scope. Jede Auswahl bekommt
  deshalb ihren eigenen Agenten, einmal gebaut und wiederverwendet.
*/
const agenten = new Map<string, ReturnType<typeof postfachAgent>>();
const ergebnisse = new Map<string, { brief: Brief; akte: Akte }>();

function agentFuer(auswahl: Werkzeugauswahl) {
  const schluessel = [...(auswahl.ohne ?? [])].sort().join(',');
  let agent = agenten.get(schluessel);
  if (!agent) {
    agent = postfachAgent(
      scope,
      `p${agenten.size}`,
      async (kontext, brief, akte) => {
        ergebnisse.set(kontext.kanal ?? '', { brief, akte });
      },
      async () => {},
      auswahl,
    );
    agenten.set(schluessel, agent);
  }
  return agent;
}

export async function laufePostfach(
  mail: { absender: string; absenderName?: string; betreff: string; text: string },
  auswahl: Werkzeugauswahl = {},
): Promise<Postfachlauf> {
  const agent = agentFuer(auswahl);
  const kanal = `lauf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const beginn = Date.now();
  const von = mail.absenderName ? `${mail.absenderName} <${mail.absender}>` : mail.absender;
  const griff = await agent.stream(`Von: ${von}\nBetreff: ${mail.betreff}\n\n${mail.text}`, {
    channelId: kanal,
    userId: mail.absender,
    context: {
      absender: mail.absender,
      absenderName: mail.absenderName,
      betreff: mail.betreff,
      postfach: POSTFAECHER[0].adresse,
      eingang: mail.text,
      kanal,
    },
  });
  await griff.complete();
  const ergebnis = ergebnisse.get(kanal);
  return {
    brief: ergebnis?.brief,
    rumpf: ergebnis ? baueRumpf(ergebnis.brief, ergebnis.akte) : undefined,
    akte: ergebnis?.akte,
    fragen: ergebnis?.akte.fragen ?? [],
    dauerMs: Date.now() - beginn,
  };
}

/** Die Hallbach-Mail aus Abschnitt 2, so wie ein Teilnehmer sie schicken würde. */
export const HALLBACH = {
  absender: 'andreas.walter@example.com',
  absenderName: 'Andreas Walter',
  betreff: SEED_MAIL.subject,
  text: [
    ...SEED_MAIL.body,
    ...(SEED_MAIL.facts?.length ? ['', ...SEED_MAIL.facts.map(([k, v]) => `${k}: ${v}`)] : []),
  ].join('\n'),
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const lauf = await laufePostfach(HALLBACH);
  if (!lauf.rumpf) {
    console.error(`Der Agent hat nach ${lauf.dauerMs} ms nicht gesendet.`);
    process.exitCode = 1;
  } else {
    console.log(`Betreff: ${lauf.brief?.betreff}\n\n${lauf.rumpf}\n\n(${lauf.dauerMs} ms)`);
  }
}
