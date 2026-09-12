// Erzeugt aus packages/docs/storyboard/storyboard.html.
// Ab hier ist DIESE Datei die Quelle der Wahrheit für den Vortrag.

import type { Block, Slide } from "./types";

export const BLOCKS: Block[] = [
  {
    "n": 1,
    "tab": "Provokation",
    "title": "KI wird Dir Deinen Job wegnehmen",
    "claim": "Wir zeigen, WAS der Agent getan hat — nicht WIE. Die Mail geht rein, sieben Minuten später verhandelt er. Woher sein Wissen kommt, bleibt offen bis Block 3.",
    "budget": "8 Min · 5 Inhalt + 3 Interaktion"
  },
  {
    "n": 2,
    "tab": "Entwarnung",
    "title": "…wird Dir Deinen Job wegnehmen",
    "claim": "Diesen Satz haben Menschen schon oft gehört. Jedes Mal fielen Jobs weg — und jedes Mal blieb die Massenarbeitslosigkeit aus. Aber die Transformation selbst ist real.",
    "budget": "10 Min · 7 Inhalt + 3 Interaktion"
  },
  {
    "n": 3,
    "tab": "Beweis",
    "title": "KI wird Dir Deinen Job erleichtern",
    "claim": "Vier Stufen an derselben E-Mail: von „kann nichts“ bis „handelt autonom“. Jede Stufe fügt genau einen technischen Baustein hinzu.",
    "budget": "28 Min · 15 Demo + 13 Interaktion"
  },
  {
    "n": 4,
    "tab": "Veränderung",
    "title": "KI wird Deinen Job verändern",
    "claim": "Die Frage vom Anfang beantworten, den Bogen schließen, und mit etwas Konkretem nach Hause schicken.",
    "budget": "14 Min · 5 Inhalt + 9 Diskussion"
  }
] as Block[];

export const SLIDES: Slide[] = [
  {
    "b": 1,
    "kind": "Titel",
    "headline": "Warum Dein KI-Agent noch keine Aufgaben für Dich übernimmt",
    "sub": "…und wie Du dahin kommst.",
    "mock": {
      "t": "statement",
      "text": "Carsten Koch",
      "after": "Global Account Manager Retail · Amazon Web Services"
    },
    "say": "Kein Warmlaufen. Titel steht, dann direkt in die E-Mail.",
    "n": 1
  },
  {
    "b": 1,
    "kind": "Outlook",
    "headline": "Freitag, 14:12 Uhr. Eine E-Mail.",
    "mock": {
      "t": "mail",
      "app": "Microsoft Outlook — Posteingang",
      "from": "Andreas Walter · Hallbach Süßwaren",
      "to": "Lisa Berger",
      "time": "Fr 14:12",
      "subject": "Exklusive Markteinführung: Hallbach Crispy Bites",
      "body": [
        "Liebe Frau Berger, wir möchten unser neues Produkt Hallbach Crispy Bites exklusiv mit Ihnen einführen. Unser Wunschtermin für den Start ist der 15. Oktober.",
        "Über eine Rückmeldung bis Ende nächster Woche würden wir uns freuen."
      ],
      "facts": [
        [
          "EK-Preis",
          "2,89 €"
        ],
        [
          "Empf. VK",
          "4,49 €"
        ],
        [
          "Mindestabnahme",
          "500 VE"
        ],
        [
          "Wunschstart",
          "15. Okt."
        ]
      ]
    },
    "say": "Die E-Mail laut vorlesen. Sie ist die Klammer über alle vier Blöcke — das Publikum sieht sie noch dreimal wieder. Lisa Berger kurz vorstellen: Category Managerin, Kategorie Schokolade & Pralinen.",
    "note": "Alle Firmen-, Marken- und Personennamen im Szenario sind erfunden. Einmal zu Beginn ansagen — im Raum können Hersteller und Händler sitzen, die sich sonst wiedererkennen.",
    "app": "Outlook-Oberfläche mit genau dieser Mail. Auf Beamer-Distanz lesbar: Betreff und die vier Eckdaten müssen aus 15 m Entfernung erkennbar sein.",
    "n": 2
  },
  {
    "b": 1,
    "kind": "Kontrast",
    "headline": "Was Lisa dafür normalerweise braucht: einen Tag.",
    "sub": "Acht Systeme. Vier bis fünf Ansprechpartner. Wenn alles glattgeht.",
    "mock": {
      "t": "list",
      "ordered": true,
      "items": [
        [
          "Listungsantrag verstehen",
          "Exklusivität, Termin, Konditionen"
        ],
        [
          "Warenwirtschaft prüfen",
          "Wie performt die Kategorie? Wer ist Underperformer?"
        ],
        [
          "Marktdaten checken",
          "Trend im Segment Bites / Snacking"
        ],
        [
          "Regalplanung prüfen",
          "Ist Platz? Wer müsste weichen?"
        ],
        [
          "Marge rechnen",
          "EK gegen kalkulierten VK, Kategorievorgabe"
        ],
        [
          "Aktionsplanung prüfen",
          "Gibt es eine Gelegenheit für eine Einführungsaktion?"
        ],
        [
          "Logistik informieren",
          "Passt das in den Lieferrhythmus?"
        ],
        [
          "Marktleiter informieren",
          "Welche Märkte sind betroffen?"
        ],
        [
          "Rückmail an den Hersteller",
          "Entscheidung oder Gegenvorschlag"
        ]
      ]
    },
    "say": "Die einzige Folie in Block 1, die Zeit bekommt — rund eine Minute. Diese Liste ist die Fallhöhe; ohne sie landet nichts von dem, was danach kommt.",
    "note": "Ergänzung gegenüber dem Vortragsverlauf: Dort steht diese Liste nur in der Szenariobeschreibung, nicht als Folie.",
    "n": 3
  },
  {
    "b": 1,
    "kind": "Outlook · Black Box",
    "headline": "Sieben Minuten später.",
    "sub": "Niemand hat den Agenten gefragt, was er tut. Das hier ging raus:",
    "mock": {
      "t": "mail",
      "app": "Microsoft Outlook — Gesendet",
      "sent": true,
      "from": "Lisa Berger",
      "to": "Andreas Walter · Hallbach Süßwaren",
      "time": "Fr 14:19",
      "subject": "AW: Exklusive Markteinführung: Hallbach Crispy Bites",
      "body": [
        "Wir können das Produkt listen. Wir schlagen einen Start am 22. Oktober vor — eine Woche nach Ihrem Wunschtermin.",
        "Grund: In 12 Märkten im Raum Hamburg werden zu diesem Datum Zweitplatzierungsflächen frei, die wir für eine Einführungsaktion nutzen können.",
        "Bedingung: 15 % Einführungsrabatt für die ersten vier Wochen."
      ],
      "facts": [
        [
          "Vorgeschlagener Start",
          "22. Okt."
        ],
        [
          "Aktionsmärkte",
          "12"
        ],
        [
          "Geforderter Rabatt",
          "15 %"
        ],
        [
          "Laufzeit",
          "4 Wochen"
        ]
      ]
    },
    "say": "Der Agent sagt nicht ja — er verhandelt. Die Frage einmal laut stellen und dann stehen lassen: „Woher wusste er von diesen freien Flächen?“ Nicht beantworten. Das ist der Haken, an dem Block 3 hängt.",
    "app": "Nur Abspielmodus nötig: Mail rein, Mail raus. Block 1 muss NICHT live laufen — die schrittweise Steuerung braucht erst Stufe d.",
    "n": 4
  },
  {
    "b": 1,
    "kind": "Agent",
    "headline": "Hallbach sagt zu. Und dann läuft alles an.",
    "sub": "Zwei Stunden später bestätigt Hallbach den neuen Termin. Der Agent setzt um — in vier Systemen gleichzeitig.",
    "mock": {
      "t": "fan",
      "cells": [
        {
          "sys": "SAP",
          "act": "Bestellungen angelegt",
          "qty": "Hallbach Crispy Bites · 500 VE"
        },
        {
          "sys": "Regalplanung",
          "act": "Planogramm aktualisiert",
          "qty": "Nocturne Mini raus · Crispy Bites rein"
        },
        {
          "sys": "Logistik",
          "act": "Lieferrhythmus informiert",
          "qty": "Neues Produkt ab KW 43"
        },
        {
          "sys": "Teams",
          "act": "Marktleiter benachrichtigt",
          "qty": "12 Märkte · Displaywechsel 22. Okt."
        }
      ]
    },
    "say": "Die vier Kacheln gleichzeitig aufdecken, nicht nacheinander. Der Eindruck von Gleichzeitigkeit ist der Punkt. Ein Produkt wurde ausgelistet — das nebenbei erwähnen, nicht betonen.",
    "app": "Vier Systeme quittieren die Schreiboperation sichtbar. Die 12 Marktleiter-Nachrichten sollten als echte Liste erscheinen, nicht als Zahl.",
    "n": 5
  },
  {
    "b": 1,
    "kind": "Kernsatz",
    "headline": "Kein Mensch wurde gefragt.",
    "mock": {
      "t": "statement",
      "text": "Alle wurden nur informiert."
    },
    "say": "Absatz. Nicht erklären. Stehen lassen.",
    "n": 6
  },
  {
    "b": 1,
    "kind": "Frage",
    "headline": "Braucht man uns dann noch?",
    "sub": "uns = Wissensarbeiter",
    "mock": {
      "t": "statement",
      "text": "Menschen, die mit Informationen arbeiten."
    },
    "say": "„Uns“, nicht „Sie“ — Du sitzt mit im Boot, das nimmt der Frage das Anklagende. Wissensarbeiter mündlich erklären: jemand, der mit Informationen arbeitet. Und genau das ist die Stärke generativer KI und großer Sprachmodelle — nicht Muskelkraft, nicht Feinmotorik, sondern Informationsarbeit. Damit trifft die Frage jeden im Raum.",
    "inter": "Handzeichen: „Wer glaubt, dass wir diesen Zustand in den nächsten Jahren erreichen?“ · Offene Frage: „Wie geht es Ihnen damit?“",
    "n": 7
  },
  {
    "b": 2,
    "kind": "Historie",
    "headline": "Den Satz haben Menschen schon oft gehört.",
    "mock": {
      "t": "timeline",
      "rows": [
        [
          "1780",
          "<b>Dampfmaschine</b> — die Maschine ersetzt den Handwerker"
        ],
        [
          "1890",
          "<b>Elektrifizierung</b> — die Fabrik braucht weniger Hände"
        ],
        [
          "1960",
          "<b>Roboter</b> — das Fließband kommt ohne aus"
        ],
        [
          "1995",
          "<b>Internet</b> — ganze Berufsbilder verschwinden"
        ],
        [
          "2023",
          "<b>KI</b> — und jetzt die Wissensarbeiter"
        ]
      ]
    },
    "say": "Schnell durchgehen. Das Publikum kennt die Liste — der Wiedererkennungseffekt ist der Zweck.",
    "n": 8
  },
  {
    "b": 2,
    "kind": "Daten",
    "headline": "Und es stimmte ja auch.",
    "sub": "Millionen Arbeitsplätze verschwanden — und trotzdem entstand keine Massenarbeitslosigkeit.",
    "mock": {
      "t": "chart",
      "which": "agriculture"
    },
    "say": "Ehrlich sein: Ja, die Jobs sind wirklich weg. Das nicht kleinreden — sonst verliert der nächste Punkt seine Kraft.",
    "n": 9
  },
  {
    "b": 2,
    "kind": "Konzept",
    "headline": "Der Irrtum von der festen Menge Arbeit",
    "sub": "David Frederick Schloss prägte 1891 den Begriff der „Lump of Labor Fallacy“ — die Annahme, es gäbe eine feste Menge an Arbeit in einer Volkswirtschaft.",
    "mock": {
      "t": "list",
      "ordered": false,
      "items": [
        [
          "Kosten sinken",
          "weil die Arbeit billiger oder schneller wird"
        ],
        [
          "Nachfrage steigt",
          "weil sich mehr Menschen mehr leisten können"
        ],
        [
          "Neue Arbeit entsteht",
          "in Tätigkeiten, die es vorher nicht gab"
        ]
      ]
    },
    "say": "Der einzige rein theoretische Moment im Vortrag. Kurz halten.",
    "n": 10
  },
  {
    "b": 2,
    "kind": "Daten",
    "headline": "Die Ausschläge kamen von Kriegen und Krisen. Nicht von Technologie.",
    "sub": "Die Quote schwankte zwischen 0,4 % und 30 % — quer durch fünf technologische Revolutionen.",
    "mock": {
      "t": "chart",
      "which": "unemployment"
    },
    "say": "Der Punkt ist nicht die Zahl von heute, sondern woher die Ausschläge kamen.",
    "open": "Für die echte Folie fehlt die Zeitreihe (Destatis / BA). Die Ausschläge — Weimar, Nachkriegszeit, Wiedervereinigung — sind das eigentliche Argument und lassen sich aus den vier Eckwerten allein nicht zeigen.",
    "n": 11
  },
  {
    "b": 2,
    "kind": "Historie",
    "headline": "Die Propheten lagen falsch. Zwei von drei.",
    "sub": "Drei Warnungen aus drei Epochen. Zwei sind entschieden — eine läuft noch.",
    "mock": {
      "t": "list",
      "ordered": false,
      "items": [
        [
          "John von Neumann, 1949",
          "prognostizierte ein „Jahrzehnt des Ruins“ — die Beschäftigung stieg in sechs Jahren um vier Millionen"
        ],
        [
          "Jeremy Rifkin, 1995",
          "warnte vor dem „Ende der Arbeit“ — danach fiel die US-Arbeitslosigkeit unter 4 %"
        ],
        [
          "Dario Amodei, Mai 2025",
          "KI könne die Hälfte aller Einstiegsjobs im Bürobereich vernichten und die Arbeitslosigkeit binnen ein bis fünf Jahren auf 10–20 % treiben. Im Februar 2026 bekräftigt — offen."
        ]
      ]
    },
    "say": "Die ersten beiden schnell. Bei Amodei anhalten: Das ist der CEO von Anthropic — der Firma, deren KI ihren eigenen Code schreibt. Er verkauft das Produkt und warnt trotzdem. Und er meint genau unsere Gruppe von vorhin: Wissensarbeiter.",
    "note": "Quelle: Interview mit Jim VandeHei und Mike Allen, Axios, 28. Mai 2025. Die Formulierung „white-collar bloodbath“ stammt von Axios, nicht von Amodei — nicht als sein Zitat wiedergeben.",
    "n": 12
  },
  {
    "b": 2,
    "kind": "Beleg",
    "headline": "Und das Muster wiederholt sich gerade in Echtzeit.",
    "mock": {
      "t": "tweets",
      "items": [
        {
          "handle": "@user · 14. Feb. 2026",
          "text": "Claude Code is writing 100% of Claude code now. But Anthropic has 100+ open dev positions on their jobs page. ?"
        },
        {
          "handle": "@bcherny · Erfinder von Claude Code, Anthropic",
          "reply": true,
          "text": "Someone has to prompt the Claudes, talk to customers, coordinate with other teams, decide what to build next. Engineering is changing and great engineers are more important than ever."
        }
      ]
    },
    "say": "Der Clou: Das ist dieselbe Firma. Der CEO warnt vor dem Verschwinden der Einstiegsjobs — der Erfinder von Claude Code sagt, gute Entwickler seien wichtiger denn je. Das ist kein Widerspruch, den man auflösen muss. Beide haben recht: Die Ausführung verschwindet, das Urteil wird wertvoller. Genau das ist die Botschaft des Abends.",
    "app": "Screenshot liegt vor: tweet-on-claude.png. Für die Folie den Screenshot nehmen — er beglaubigt stärker als gesetzter Text.",
    "n": 13
  },
  {
    "b": 2,
    "kind": "Daten",
    "headline": "Und was sagen die Daten, ein Jahr später?",
    "sub": "Stanford, Juli 2026: Wer stark KI-exponiert arbeitet, wurde seit 2022 nicht häufiger arbeitslos als der Rest — eher seltener.",
    "mock": {
      "t": "chart",
      "which": "exposure"
    },
    "say": "Die ehrliche Zwischenbilanz. Zwei Befunde nennen: Erstens — Firmen, die KI einführten, beschäftigten zwei Jahre später 10 % MEHR Menschen. Zweitens — eine Ausnahme gibt es: Berufseinsteiger. Deren Arbeitslosigkeit stieg in drei Jahren um 1,6 Punkte auf 5,6 %. Da passiert etwas Reales.",
    "note": "Quelle: Neale Mahoney, Erika McEntarfer, Karsen Wahal, SIEPR Policy Brief, Stanford, Juli 2026. Die Autoren schränken selbst ein: Zinswende und Überstellung nach der Pandemie kommen als Ursachen infrage, die Zuordnung zur KI ist nicht eindeutig. Diese Einschränkung mitnennen — sie macht die Aussage stärker, nicht schwächer.",
    "n": 14
  },
  {
    "b": 2,
    "kind": "Kernsatz",
    "headline": "Coding war nie das eigentliche Problem.",
    "sub": "Die Arbeit verschiebt sich — von der Ausführung zur Steuerung, zur Urteilsfähigkeit, zur Entscheidung, was überhaupt gebaut werden soll.",
    "mock": {
      "t": "statement",
      "text": "Aber die Phase der Transformation ist herausfordernd.",
      "after": "Jobs fallen weg. Neue entstehen. Nicht über Nacht — und nicht automatisch für dieselben Menschen."
    },
    "say": "Hier ehrlich bleiben. Wer jetzt zu optimistisch wird, verliert den Raum.",
    "inter": "Offene Frage, 2–3 Antworten sammeln: „Welche Aufgaben haben Sie heute schon an KI abgegeben, die Sie früher selbst gemacht haben?“",
    "n": 15
  },
  {
    "b": 3,
    "kind": "Überleitung",
    "headline": "Es liegt nicht am Modell. Es liegt am Kontext.",
    "sub": "Genug Theorie. Wir bauen den Agenten jetzt in vier Stufen auf — von nutzlos bis autonom. Jede Stufe fügt genau einen Baustein hinzu.",
    "mock": {
      "t": "list",
      "ordered": false,
      "items": [
        [
          "Stufe a",
          "Ein nacktes Modell · nur Trainingsdaten"
        ],
        [
          "Stufe b",
          "+ Systemprompt und Gesprächsverlauf"
        ],
        [
          "Stufe c",
          "+ Tools"
        ],
        [
          "Stufe d",
          "+ Autonomie"
        ]
      ]
    },
    "say": "Die Stufenübersicht bleibt als Orientierung während des ganzen Blocks abrufbar.",
    "n": 16
  },
  {
    "b": 3,
    "kind": "Chat · Stufe a",
    "headline": "Stufe a) Ein nacktes Modell",
    "sub": "Dieselbe E-Mail. Kein Kontext. Die Aufgabe: „Bearbeite diesen Vorgang.“",
    "mock": {
      "t": "chat",
      "app": "Agent — ohne Kontext",
      "msgs": [
        {
          "who": "Lisa",
          "role": "user",
          "text": "Bearbeite diesen Vorgang. [E-Mail von Hallbach angehängt]"
        },
        {
          "who": "Agent",
          "role": "agent",
          "flat": true,
          "text": "Vielen Dank für Ihren Listungsantrag. Wir werden Ihr Anliegen prüfen und uns zeitnah bei Ihnen melden."
        }
      ]
    },
    "say": "Die Enttäuschung ausspielen. „So endet für die meisten das KI-Experiment.“",
    "app": "Ein Chatfenster ohne jede Anbindung. Bewusst nackt — kein Branding, keine Tools.",
    "n": 17
  },
  {
    "b": 3,
    "kind": "Technik · Stufe a",
    "headline": "Trainingsdaten",
    "sub": "Jedes große Sprachmodell wurde auf riesigen Textmengen trainiert. Das ist sein Allgemeinwissen — aber es kennt weder Ihre Firma noch Ihre Produkte noch Ihre Kunden.",
    "mock": {
      "t": "statement",
      "text": "Wie ein neuer Mitarbeiter am ersten Tag: intelligent, aber ahnungslos."
    },
    "say": "Das Bild vom neuen Mitarbeiter trägt durch den ganzen Block — später wieder aufgreifen.",
    "n": 18
  },
  {
    "b": 3,
    "kind": "Chat · Stufe b",
    "headline": "Stufe b) „Da ist eine E-Mail für Dich“",
    "sub": "Dieselbe E-Mail — aber der Agent hat jetzt ein Briefing und einen aufgebauten Gesprächsverlauf.",
    "mock": {
      "t": "chat",
      "app": "Agent — mit Systemprompt",
      "msgs": [
        {
          "who": "Lisa",
          "role": "user",
          "text": "Was liegt an?"
        },
        {
          "who": "Agent",
          "role": "agent",
          "text": "Lisa, du hast einen Listungsantrag von Hallbach erhalten. Neues Produkt: Hallbach Crispy Bites. EK 2,89 €, empf. VK 4,49 €, Mindestabnahme 500 VE, gewünschter Start 15. Oktober. Es handelt sich um eine Exklusiveinführung."
        }
      ]
    },
    "say": "Noch keine Handlung — aber schon Zeitersparnis. Zusammenfassung und Einordnung.",
    "app": "Derselbe Chat, jetzt mit Systemprompt. Der Systemprompt sollte einblendbar sein — das Publikum will sehen, was drinsteht.",
    "n": 19
  },
  {
    "b": 3,
    "kind": "Technik · Stufe b",
    "headline": "Systemprompt und Gesprächsverlauf",
    "mock": {
      "t": "list",
      "ordered": false,
      "items": [
        [
          "Der Systemprompt",
          "Das Briefing vor der ersten Nachricht: wer der Agent ist, welche Rolle er hat, welche Regeln gelten. Seine Einarbeitung."
        ],
        [
          "Der Gesprächsverlauf",
          "Jede Nachricht geht nicht allein ans Modell — der gesamte bisherige Verlauf wird mitgeschickt. Jeder Turn trägt zum Wissen bei."
        ]
      ]
    },
    "say": "Das ist der Baustein, den fast niemand im Raum kennt. Zeit dafür nehmen.",
    "n": 20
  },
  {
    "b": 3,
    "kind": "Demo · Stufe b",
    "headline": "Wir nehmen eine Nachricht aus dem Verlauf heraus.",
    "sub": "Dieselbe Frage, ein Turn weniger — und die Antwort ändert sich komplett.",
    "mock": {
      "t": "diff",
      "before": {
        "h": "Mit dem Turn",
        "p": "„Nocturne Mini läuft seit drei Quartalen rückläufig — das wäre der Kandidat für die Auslistung.“"
      },
      "after": {
        "h": "Ohne den Turn",
        "p": "„Für eine Aussage zur Auslistung fehlen mir die Abverkaufszahlen der Kategorie.“"
      }
    },
    "say": "Der stärkste Aha-Moment des Blocks. Erst die Antwort zeigen, dann den Turn löschen, dann dieselbe Frage nochmal.",
    "app": "Der Gesprächsverlauf muss editierbar sein — einzelne Turns sichtbar löschen und die Anfrage erneut absenden.",
    "n": 21
  },
  {
    "b": 3,
    "kind": "Chat · Stufe c",
    "headline": "Stufe c) „…und hier ist ein Antwortentwurf“",
    "sub": "Dieselbe E-Mail — aber jetzt mit Zugriff auf die Systeme.",
    "mock": {
      "t": "chat",
      "app": "Agent — mit Tools",
      "msgs": [
        {
          "who": "Lisa",
          "role": "user",
          "text": "Was liegt an?"
        },
        {
          "who": "Agent",
          "role": "agent",
          "tools": [
            "warenwirtschaft.kategorie",
            "marktdaten.segment",
            "regalplanung.platz",
            "aktionskalender.zeitraum"
          ],
          "text": "Kategorie wächst +3,2 %. Underperformer: Nocturne Mini (−12 %). Regalplatz frei, wenn Nocturne Mini geht. Marge 34,2 % — über Vorgabe. Und: Am 22. Oktober werden in 12 Hamburger Märkten Aufsteller frei. Hier ist ein Antwortentwurf."
        }
      ]
    },
    "say": "Die Tool-Aufrufe müssen sichtbar durchlaufen. Das ist der Beweis, dass er wirklich nachgeschaut hat.",
    "app": "Tool-Aufrufe live und einzeln sichtbar — mit Name und Rückgabewert. Am Ende ein Antwortentwurf, den Lisa prüft und absendet.",
    "n": 22
  },
  {
    "b": 3,
    "kind": "Technik · Stufe c",
    "headline": "Tools",
    "sub": "Bisher konnte der Agent nur reden. Durch Tools kann er Daten abrufen, Systeme abfragen und Entwürfe produzieren.",
    "mock": {
      "t": "statement",
      "text": "Er bereitet die Arbeit vor. Der Mensch entscheidet und klickt „Senden“."
    },
    "say": "Hier ist die Grenze zwischen c und d: Wer klickt „Senden“?",
    "n": 23
  },
  {
    "b": 3,
    "kind": "Agent · Stufe d",
    "headline": "Stufe d) Jetzt öffnen wir die Box.",
    "sub": "Dieselbe E-Mail, dieselben sieben Minuten wie zu Beginn — diesmal sehen wir zu.",
    "mock": {
      "t": "run",
      "steps": [
        {
          "sys": "Outlook",
          "txt": "E-Mail gelesen und eingeordnet",
          "out": "Listungsantrag · Exklusiveinführung · Wunschstart <b>15. Okt.</b>"
        },
        {
          "sys": "Warenwirtschaft",
          "txt": "Kategorie Schokolade & Pralinen geprüft",
          "out": "Wachstum <b>+3,2 % YoY</b> · Underperformer: Nocturne Mini <b>−12 %</b>"
        },
        {
          "sys": "Marktdaten",
          "txt": "Segment Bites / Snacking geprüft",
          "out": "Aufwärtstrend — das Produkt passt ins Portfolio"
        },
        {
          "sys": "Kalkulation",
          "txt": "Marge gerechnet",
          "out": "<b>34,2 %</b> bei EK 2,89 € / VK 4,49 € — Vorgabe 30 %"
        }
      ]
    },
    "say": "Jetzt darf es langsam sein. In Block 1 war es ein Schock, hier ist es eine Erklärung. Vier Systeme — dieselben vier, die auf Lisas Tagesliste standen.",
    "app": "Schrittweise steuerbar: nach jedem Tool-Aufruf anhaltbar, damit erklärt werden kann. Das ist der einzige Ablauf, der diese Steuerung wirklich braucht.",
    "n": 24
  },
  {
    "b": 3,
    "kind": "Auflösung · Stufe d",
    "headline": "Und das ist die Antwort auf die Frage von vorhin.",
    "sub": "Niemand hat den Agenten gebeten, im Aktionskalender nachzusehen. Er hat es getan, weil ein Termin im Raum stand.",
    "mock": {
      "t": "run",
      "steps": [
        {
          "sys": "Aktionskalender",
          "txt": "Kampagnen im Umfeld des Wunschtermins geprüft",
          "out": "Kampagne „Herbstwochen“ endet am <b>22. Oktober</b>",
          "key": true
        },
        {
          "sys": "Regalplanung",
          "txt": "Freiwerdende Flächen ermittelt",
          "out": "<b>12 Märkte</b> im Raum Hamburg · Zweitplatzierung Aufsteller",
          "key": true
        },
        {
          "sys": "Business Case",
          "txt": "Verschiebung um eine Woche durchgerechnet",
          "out": "Erwarteter Uplift durch Zweitplatzierung — <b>positiv</b>",
          "key": true
        }
      ]
    },
    "say": "Der Höhepunkt des Vortrags. Explizit zurückverweisen: „Das war die Frage von vor 40 Minuten — woher wusste er von den freien Flächen?“ Hier wird der Agent von einem schnellen Werkzeug zu etwas anderem.",
    "app": "Aktionskalender mit auslaufenden Kampagnen und Display-/Regalplatzbestand je Markt. Beides fehlt heute im Datenmodell — das sind die beiden Tabellen, die diese Folie erzwingt.",
    "n": 25
  },
  {
    "b": 3,
    "kind": "Agent · Stufe d",
    "headline": "Den Rest haben Sie schon gesehen.",
    "sub": "Gegenvorschlag, Bestätigung, vier Systeme. Genau wie am Anfang — nur wissen Sie jetzt, was davor passiert ist.",
    "mock": {
      "t": "fan",
      "cells": [
        {
          "sys": "Outlook",
          "act": "Gegenvorschlag gesendet",
          "qty": "Start 22. Okt. · 15 % Rabatt"
        },
        {
          "sys": "Outlook",
          "act": "Bestätigung empfangen",
          "qty": "Hallbach stimmt zu"
        },
        {
          "sys": "SAP · Regal · Logistik",
          "act": "Umgesetzt",
          "qty": "Bestellung · Planogramm · Lieferrhythmus"
        },
        {
          "sys": "Teams",
          "act": "Informiert",
          "qty": "12 Marktleiter — ohne Rückfrage"
        }
      ]
    },
    "say": "Schnell durchgehen. Die Wiederholung ist beabsichtigt, aber sie darf keine Zeit kosten.",
    "n": 26
  },
  {
    "b": 3,
    "kind": "Kernsatz",
    "headline": "Der Kreis schließt sich.",
    "mock": {
      "t": "statement",
      "text": "Das ist das Szenario vom Anfang.",
      "after": "Der Mensch kommt erst hinterher ins Spiel — zur Kontrolle, nicht zur Ausführung."
    },
    "say": "Kurz zurück auf Block 1 verweisen. Das Publikum soll die Klammer merken.",
    "n": 27
  },
  {
    "b": 3,
    "kind": "Frage",
    "headline": "Kann er das? Darf er das? Sollte er das?",
    "sub": "Das kennen wir eigentlich schon — es heißt automatische Disposition. Aber hier trifft der Agent komplexe Geschäftsentscheidungen: was gelistet wird, was weichen muss, wann der beste Zeitpunkt ist, welche Konditionen verhandelt werden.",
    "mock": {
      "t": "statement",
      "text": "Drei Fragen. Wir beantworten sie nicht — das Publikum tut es."
    },
    "say": "Bewusst offen lassen und ins Publikum geben. Das ist der Übergang in Block 4.",
    "inter": "„Was hat sich von Stufe zu Stufe verändert?“ · „Welche Aufgabe in Ihrem Alltag könnte so aussehen?“",
    "n": 28
  },
  {
    "b": 3,
    "kind": "Interaktiv",
    "headline": "Jetzt Sie.",
    "sub": "Die Teilnehmer schreiben an ein vorbereitetes Postfach. Dahinter wartet ein Agent, der die Nachricht verarbeitet und antwortet.",
    "mock": {
      "t": "mail",
      "app": "Ihr Telefon — Neue Nachricht",
      "sent": true,
      "from": "Sie",
      "to": "agent@…",
      "time": "jetzt",
      "subject": "(worüber Sie wollen)",
      "body": [
        "Schreiben Sie dem Agenten eine Aufgabe aus Ihrem eigenen Alltag. Sie bekommen zwei Antworten: eine ohne Kontext, eine mit."
      ]
    },
    "say": "Am eigenen Beispiel erleben, was die vier Stufen bedeuten.",
    "open": "Zwei offene Punkte: Das Postfach ist technisch noch nicht vorbereitet, und die Platzierung im Block steht nicht fest — nach Stufe b oder als Abschluss nach Stufe d.",
    "n": 29
  },
  {
    "b": 4,
    "kind": "Auflösung",
    "headline": "Braucht man uns dann noch?",
    "mock": {
      "t": "statement",
      "text": "Ja. Aber anders als heute."
    },
    "say": "Wörtlich die Frage aus Block 1 wiederholen — „uns“, gleiche Betonung. Wenn das Publikum sie wiedererkennt, hat der Bogen getragen.",
    "n": 30
  },
  {
    "b": 4,
    "kind": "Kernsatz",
    "headline": "Wir sind nicht mehr die Ausführenden.",
    "sub": "KI kann gewaltig viel — wenn man ihr die richtigen Rahmenbedingungen gibt. Und genau das ist die neue Aufgabe.",
    "mock": {
      "t": "statement",
      "text": "Der operative Mitarbeiter wird zum Manager von KI-Agenten."
    },
    "say": "Das ist die eigentliche Botschaft des Vortrags. Alles davor führt hierhin.",
    "n": 31
  },
  {
    "b": 4,
    "kind": "Zitat",
    "headline": "Und die Latte wird sofort höher gelegt.",
    "mock": {
      "t": "quote",
      "text": "Customers are always beautifully, wonderfully dissatisfied. Even if they report being happy.",
      "cite": "Jeff Bezos"
    },
    "say": "Kunden gewöhnen sich schnell. Sie werden wissen, dass KI im Hintergrund arbeitet — und mehr erwarten.",
    "n": 32
  },
  {
    "b": 4,
    "kind": "Kernsatz",
    "headline": "Die Arbeit wird nicht weniger. Sie wird anders.",
    "sub": "Die Rahmenbedingungen aufzubauen ist kein Wochenendprojekt. Es ist eine Aufgabe, die uns Jahre beschäftigen wird.",
    "mock": {
      "t": "statement",
      "text": "Wer jetzt anfängt zu lernen, lernt schneller.",
      "after": "Wer schneller lernt, zieht schneller Nutzen — schneller als die Konkurrenz."
    },
    "say": "Der Grund, warum sie heute Abend hier sind. Das explizit sagen.",
    "n": 33
  },
  {
    "b": 4,
    "kind": "Handlung",
    "headline": "Drei Dinge, die Sie morgen tun können.",
    "mock": {
      "t": "list",
      "ordered": true,
      "items": [
        [
          "Eine wiederkehrende Aufgabe nehmen",
          "und einen KI-Agenten damit füttern — mit echtem Kontext, nicht nur einem Prompt."
        ],
        [
          "Fragen: Welches Wissen bräuchte ein Agent",
          "um diese Aufgabe eigenständig zu lösen? Das ist Ihre Rahmenbedingung."
        ],
        [
          "Morgen früh um 8 Uhr zum Breakfast kommen",
          "und die Erfahrungen mit anderen Entscheidern teilen."
        ]
      ]
    },
    "say": "Konkret bleiben. Punkt 3 ist die Brücke zur Folgeveranstaltung.",
    "n": 34
  },
  {
    "b": 4,
    "kind": "Abschluss",
    "headline": "Morgen früh, 8:00 Uhr.",
    "sub": "„Was funktioniert, was nicht — KI-Erfahrungen unter Entscheidern“ · 17. September, 8:00–8:45 Uhr",
    "mock": {
      "t": "statement",
      "text": "Wer das Gespräch vertiefen will, ist herzlich eingeladen."
    },
    "say": "Ruhig ausklingen lassen.",
    "inter": "Offene Diskussion: „Was nehmen Sie von heute mit?“ · „Was wäre Ihr erster Schritt morgen?“",
    "n": 35
  }
] as Slide[];

export const TOTAL = SLIDES.length;

export function blockOf(n: number): Block {
  return BLOCKS[n - 1];
}
