// Quelle der Wahrheit für den Vortrag.
// Das Storyboard-Artefakt wird hieraus erzeugt: pnpm --filter @ecr-talk/docs storyboard

import type { Block, Section } from "./types";

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

export const SECTIONS: Section[] = [
  {
    "b": 1,
    "kind": "Titel",
    "title": "Warum Dein KI-Agent noch keine Aufgaben für Dich übernimmt",
    "sub": "…und wie Du dahin kommst.",
    "hero": true,
    "panels": [
      {
        "at": "18:00",
        "mock": {
          "t": "statement",
          "text": "Carsten Koch",
          "after": "Global Account Manager Retail · Amazon Web Services"
        },
        "say": "Guten Tag. Schön, dass Du hier bist. Lass uns nicht um den heißen Brei herumreden."
      }
    ],
    "n": 1
  },
  {
    "b": 1,
    "kind": "These · Szenario",
    "title": "KI wird uns unsere Jobs wegnehmen.",
    "hero": true,
    "panels": [
      {
        "at": "18:01",
        "say": "KI wird uns unsere Jobs wegnehmen. Ich will das an einem Beispiel verdeutlichen."
      },
      {
        "at": "18:02",
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
        "say": "Freitagnachmittag, kurz nach zwei. Lisa Berger ist Category Managerin bei Nordkorb, einer Lebensmittelkette mit Schwerpunkt im Norden — sie entscheidet, welche Schokoladen und Pralinen ins Regal kommen und welche dafür weichen müssen. Bei ihr geht eine E-Mail ein. Andreas Walter von Hallbach Süßwaren will ein neues Produkt exklusiv einführen: Hallbach Crispy Bites. Einkaufspreis 2,89 Euro, empfohlener Verkaufspreis 4,49. Mindestabnahme 500 Verkaufseinheiten. Wunschtermin für den Start: der 15. Oktober. Rückmeldung bitte bis Ende nächster Woche.",
        "app": "Outlook-Oberfläche, aus 15 Metern lesbar."
      },
      {
        "at": "18:03",
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
              "Start",
              "22. Okt."
            ],
            [
              "Aktionsmärkte",
              "12"
            ],
            [
              "Rabatt",
              "15 %"
            ],
            [
              "Laufzeit",
              "4 Wochen"
            ]
          ]
        },
        "say": "Keine sieben Minuten später geht diese Antwort raus. Wir können listen — aber nicht zum 15. Oktober, sondern eine Woche später, am 22. Der Grund: In zwölf Märkten im Raum Hamburg werden an diesem Tag Zweitplatzierungsflächen frei, die sich für eine Einführungsaktion nutzen lassen. Bedingung: fünfzehn Prozent Einführungsrabatt für die ersten vier Wochen. Und jetzt das Besondere: Kein Mensch war beteiligt. Ein KI-Agent hat die E-Mail analysiert, sich einen Plan gemacht, Daten aus den Systemen geholt, sie gegeneinandergestellt, ausgewertet, Entscheidungen getroffen, die Antwort formuliert und abgeschickt. Alles in sieben Minuten."
      },
      {
        "at": "18:04",
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
        "say": "Zwei Stunden später bestätigt Hallbach. Und der Agent setzt um: Bestellungen im Warenwirtschaftssystem. Planogramm aktualisiert — Nocturne Mini raus, Crispy Bites rein. Die Logistik über den neuen Lieferrhythmus informiert. Und die zwölf Marktleiter über den Displaywechsel am 22. Oktober. Vier Systeme, gleichzeitig. Auch das ohne eine einzige Rückfrage.",
        "app": "Vier Systeme quittieren sichtbar. Die zwölf Marktleiter als echte Liste, nicht als Zahl."
      }
    ],
    "n": 2
  },
  {
    "b": 1,
    "kind": "Persona",
    "title": "Lisa Berger, Category Managerin",
    "panels": [
      {
        "at": "18:05",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "Kategorie",
              "Schokolade & Pralinen"
            ],
            [
              "Verantwortet",
              "Listung, Auslistung, Konditionen, Regalplatz, Aktionen"
            ],
            [
              "Arbeitet mit",
              "Warenwirtschaft, Marktdaten, Regalplanung, Aktionskalender, Logistik, Marktleitung"
            ]
          ]
        },
        "say": "Kurz zu Lisa, denn um ihre Arbeit geht es hier. Lisa Berger ist Category Managerin bei Nordkorb und verantwortet die Kategorie Schokolade und Pralinen. Listungsentscheidungen, Auslistungen, Konditionen, Regalplatz, Aktionsplanung — das ist ihr Tagesgeschäft. Und der Agent, den Du gerade gesehen hast, hat genau das getan, wofür sie bezahlt wird."
      },
      {
        "at": "18:06",
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
              "Logistik fragen",
              "Passt das in den Lieferrhythmus? — Antwort abwarten"
            ],
            [
              "Marktleiter informieren",
              "Welche Märkte sind betroffen? — Rückmeldung abwarten"
            ],
            [
              "Rückmail an den Hersteller",
              "Entscheidung oder Gegenvorschlag"
            ]
          ]
        },
        "say": "Wenn Lisa das selbst gemacht hätte, sähe es so aus. Antrag lesen und verstehen. In der Warenwirtschaft nachsehen, wie die Kategorie läuft und wer der Underperformer ist. Marktdaten zum Segment prüfen. Regalplanung: Ist überhaupt Platz, und wer müsste weichen? Marge rechnen. In der Aktionsplanung nachsehen, ob es eine Gelegenheit gibt. Und dann wird es zäh: Sie fragt die Logistik — und wartet. Sie fragt die Marktleitung — und wartet. Niemand von denen sitzt nur da und wartet auf Lisas Anfrage. Realistisch reden wir hier nicht von einem Tag, sondern von zwei bis drei, bis eine Antwort an Hallbach überhaupt möglich geworden wäre."
      }
    ],
    "n": 3
  },
  {
    "b": 1,
    "kind": "Kernsatz",
    "title": "Kein Mensch wurde gefragt.",
    "sub": "Alle wurden nur informiert.",
    "hero": true,
    "panels": [
      {
        "at": "18:07",
        "say": "Kein Mensch wurde gefragt. Alle wurden nur informiert."
      },
      {
        "at": "18:07",
        "mock": {
          "t": "statement",
          "text": "Braucht man uns dann noch?",
          "after": "uns = Wissensarbeiter"
        },
        "say": "Und damit die Frage, um die es heute Abend geht: Braucht man uns dann noch? Mit uns meine ich Wissensarbeiter. Menschen, die mit Informationen arbeiten — lesen, prüfen, abwägen, entscheiden, schreiben. Genau das, worin generative KI stark ist. Nicht Muskelkraft, nicht Feinmotorik. Informationsarbeit."
      }
    ],
    "n": 4
  },
  {
    "b": 1,
    "kind": "Vorstellung",
    "title": "Der Sprecher für heute",
    "panels": [
      {
        "at": "18:08",
        "mock": {
          "t": "bio",
          "photo": "/carsten.jpg",
          "name": "Carsten Koch",
          "role": "Global Account Manager Retail"
        },
        "say": "Ich bin Carsten Koch, habe mit elf Jahren das erste Mal programmiert und arbeite seit über fünfundzwanzig Jahren in der IT: Support, Qualitätssicherung, Projektmanagement, Produkt- und Innovationsmanagement, Vertrieb. Heute bin ich Global Account Manager für einen Lebensmitteleinzelhändler. Ich liebe es, auszuprobieren — und Menschen und Unternehmen dabei zu helfen, ihre Produktivität zu steigern.",
        "audience": {
          "kind": "wait",
          "id": "willkommen",
          "message": "Gleich geht es los. Lass diese Seite offen."
        }
      }
    ],
    "n": 5
  },
  {
    "b": 1,
    "kind": "Interaktiv · Publikum",
    "title": "Mach mit",
    "panels": [
      {
        "at": "18:08",
        "mock": {
          "t": "qr",
          "caption": "Das hier ist keine PowerPoint.",
          "hint": "Scanne den Code und mach mit."
        },
        "say": "Deshalb ist das hier auch keine PowerPoint-Präsentation, sondern eine Webanwendung. Und Du kannst sie auf Deinem eigenen Handy aufrufen. Scanne bitte jetzt den QR-Code. Du siehst dort etwas anderes als auf der Leinwand — nämlich genau die Stelle, an der wir gerade sind, und was Du dazu beitragen kannst.",
        "audience": {
          "kind": "wait",
          "id": "bereit",
          "message": "Schön, dass Du da bist. Gleich kommen zwei Fragen."
        }
      },
      {
        "at": "18:09",
        "mock": {
          "t": "results",
          "of": "sorge",
          "as": "matrix",
          "qr": true,
          "axes": {
            "x": "Beunruhigt Dich das?",
            "y": "Freust Du Dich darauf?"
          }
        },
        "say": "Zwei Fragen an Dich, beide auf einmal. Erstens: Beunruhigt Dich das Beispiel von eben? Und zweitens: Freust Du Dich darauf, dass es Realität wird? Die beiden schließen sich nicht aus — man kann beunruhigt sein und sich trotzdem freuen. Deshalb siehst Du Deine Antworten hier als Matrix, die sich nach und nach füllt.",
        "audience": {
          "kind": "poll",
          "id": "sorge",
          "persist": true,
          "questions": [
            {
              "id": "beunruhigt",
              "text": "Beunruhigt Dich dieses Beispiel?",
              "options": [
                {
                  "value": "ja",
                  "label": "Ja"
                },
                {
                  "value": "etwas",
                  "label": "Ein wenig"
                },
                {
                  "value": "nein",
                  "label": "Nein"
                }
              ]
            },
            {
              "id": "freude",
              "text": "Freust Du Dich darauf, dass es Realität wird?",
              "options": [
                {
                  "value": "ja",
                  "label": "Ja"
                },
                {
                  "value": "etwas",
                  "label": "Ein wenig"
                },
                {
                  "value": "nein",
                  "label": "Nein"
                }
              ]
            }
          ]
        },
        "app": "Live-Matrix aus den Antworten. Beide Fragen laufen gleichzeitig, die Matrix füllt sich sukzessive."
      },
      {
        "at": "18:09",
        "mock": {
          "t": "qr",
          "caption": "Schreib Lisa selbst.",
          "hint": "Der Link öffnet Dein Mailprogramm. Ändere den Text — bau Dein eigenes Szenario."
        },
        "say": "Und jetzt die Einladung, es selbst auszuprobieren. Auf Deinem Handy findest Du einen Link, der Dein Mailprogramm öffnet — mit einer vorbereiteten Nachricht an Lisa. Bitte ändere den Text. Bau Dein eigenes Szenario. Hinter dem Postfach wartet ein Agent, der Deine Anfrage verarbeitet und Dir antwortet. In der Antwort findest Du den Link zu dieser Präsentation, weiterführendes Material, die Liste der Aktionen, die der Agent ausgeführt hat — und den Link zur Code-Basis. Damit Du sehen kannst: Die Systeme sind simuliert. Die Arbeit des Agenten ist es nicht. Der Link bleibt den ganzen Abend offen, Du kannst das also auch später noch machen.",
        "audience": {
          "kind": "mailto",
          "id": "lisa-mail",
          "persist": true,
          "until": "20:00",
          "label": "Mail an Lisa öffnen",
          "to": "ecr2026@carstenbkoch.de",
          "subject": "Anfrage an das Category Management",
          "body": "Guten Tag Frau Berger,\n\nwir möchten ein neues Produkt bei Ihnen listen. Bitte passe diesen Text an, um Dein eigenes Szenario zu bauen.\n\nMit freundlichen Grüßen",
          "hint": "Ändere den Text, bevor Du sendest. Der Agent antwortet Dir — mit dem, was er getan hat, und den Belegen dazu.",
          "privacy": "Ich speichere Deine E-Mail-Adresse nur, bis die Antwort versendet ist. Ich hebe sie nicht auf."
        },
        "open": "Anmeldung über Google mit carsten.b.koch@gmail.com als einziger berechtigter Adresse fehlt noch — ohne sie sehen Teilnehmer dieselbe Ansicht wie die Leinwand."
      }
    ],
    "n": 6
  },
  {
    "b": 2,
    "kind": "Beleg",
    "title": "Ich bin damit nicht allein.",
    "panels": [
      {
        "at": "18:11",
        "mock": {
          "t": "quote",
          "text": "KI könnte die Hälfte aller Einstiegsjobs im Bürobereich vernichten und die Arbeitslosigkeit binnen ein bis fünf Jahren auf 10 bis 20 Prozent treiben.",
          "cite": "Dario Amodei · Anthropic · Mai 2025"
        },
        "say": "Mit dieser Sorge bin ich nicht allein. Dario Amodei, Mitgründer und Chef von Anthropic, hat im Mai 2025 genau das gesagt: Die Hälfte aller Einstiegsjobs im Bürobereich könnte verschwinden, die Arbeitslosigkeit auf zehn bis zwanzig Prozent steigen — binnen ein bis fünf Jahren. Im Februar dieses Jahres hat er das noch einmal bekräftigt. Das ist der Mann, der das Produkt verkauft. Und er warnt davor.",
        "note": "Quelle: Interview mit Jim VandeHei und Mike Allen, Axios, 28. Mai 2025. „White-collar bloodbath\" ist die Formulierung von Axios, nicht von Amodei."
      }
    ],
    "n": 7
  },
  {
    "b": 2,
    "kind": "Beleg",
    "title": "Aus demselben Haus kommt das Gegenteil.",
    "panels": [
      {
        "at": "18:12",
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
        "say": "Claude Code ist ein Produkt von Anthropic — derselben Firma. Und der Erfinder von Claude Code zeichnet ein ganz anderes Bild. Jemand muss die Modelle anleiten, mit Kunden sprechen, sich mit anderen Teams abstimmen, entscheiden, was als Nächstes gebaut wird. Und dann fällt mir auf: Es ist nicht das erste Mal, dass wir befürchtet haben, eine Technologie würde uns in die Massenarbeitslosigkeit führen.",
        "app": "Screenshot liegt vor: tweet-on-claude.png — er beglaubigt stärker als gesetzter Text."
      }
    ],
    "n": 8
  },
  {
    "b": 2,
    "kind": "Historie",
    "title": "Die Propheten vor ihm lagen falsch.",
    "panels": [
      {
        "at": "18:13",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "John von Neumann, 1949",
              "prognostizierte ein „Jahrzehnt des Ruins\" — die Beschäftigung stieg in sechs Jahren um vier Millionen"
            ],
            [
              "Jeremy Rifkin, 1995",
              "warnte vor dem „Ende der Arbeit\" — danach fiel die US-Arbeitslosigkeit unter 4 %"
            ]
          ]
        },
        "say": "John von Neumann sagte 1949 ein Jahrzehnt des Ruins voraus. In den sechs Jahren danach stieg die Beschäftigung um vier Millionen. Jeremy Rifkin veröffentlichte 1995 „Das Ende der Arbeit\" — danach fiel die US-Arbeitslosigkeit unter vier Prozent. Dieselbe Sorge, immer wieder, seit der Dampfmaschine."
      }
    ],
    "n": 9
  },
  {
    "b": 2,
    "kind": "Daten",
    "title": "Und trotzdem hatten sie recht.",
    "sub": "Millionen Arbeitsplätze verschwanden tatsächlich.",
    "panels": [
      {
        "at": "18:13",
        "mock": {
          "t": "chart",
          "which": "agriculture"
        },
        "say": "Und jetzt der Teil, den man nicht wegdiskutieren sollte: Die Propheten hatten ja recht. Die Jobs sind wirklich verschwunden. Die US-Landwirtschaft beschäftigte 1900 einundvierzig Prozent aller Erwerbstätigen. Im Jahr 2000 waren es zwei. Millionen von Arbeitsplätzen — weg. Nur: Eine dauerhafte Massenarbeitslosigkeit ist daraus nie geworden. Wenn Du Dir ansiehst, wann die Arbeitslosenquote in Deutschland wirklich ausschlug — Weltwirtschaftskrise, Nachkriegszeit, Ölkrise, Wiedervereinigung — dann waren das Kriege und Wirtschaftskrisen. Keine einzige dieser Spitzen kam von einer neuen Technologie. Die Zahlen dazu schicke ich Dir mit der Antwort-Mail.",
        "note": "Die Arbeitsmarkt-Zeitreihe wird nur gesprochen und als Beleg in der Antwort-Mail mitgeschickt — sie braucht keine eigene Folie."
      }
    ],
    "n": 10
  },
  {
    "b": 2,
    "kind": "Konzept",
    "title": "Der Irrtum von der festen Menge Arbeit",
    "sub": "David Frederick Schloss prägte 1891 den Begriff der „Lump of Labor Fallacy\".",
    "panels": [
      {
        "at": "18:14",
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
        "say": "Der Ökonom David Frederick Schloss hat dafür 1891 einen Namen gefunden: den Irrtum von der festen Menge Arbeit. Die Annahme, es gäbe einen festen Vorrat an Arbeit, und wenn eine Maschine ein Stück davon übernimmt, ist es für uns weg. So funktioniert es aber nicht. Wenn Kosten sinken, steigt die Nachfrage. Und wenn die Nachfrage steigt, entsteht neue Arbeit. Ich glaube, bei KI wird es genauso laufen — das ist meine persönliche Prognose. Softwareentwicklung wird gerade billiger. Also werden wir jetzt Probleme mit Software lösen, bei denen sich die Entwicklung vorher nicht gerechnet hätte. Wir werden mehr Software bauen. Und brauchen dafür vielleicht sogar mehr Entwickler."
      }
    ],
    "n": 11
  },
  {
    "b": 2,
    "kind": "Interaktiv · Publikum",
    "title": "Welche Aufgaben hast Du heute schon an KI abgegeben?",
    "panels": [
      {
        "at": "18:15",
        "mock": {
          "t": "results",
          "of": "abgegeben",
          "as": "list"
        },
        "say": "Und jetzt Du noch einmal. Auf Deinem Handy steht die Frage: Welche Aufgaben hast Du heute schon an eine KI abgegeben, die Du früher selbst gemacht hast? Schreib kurz mit. Deine Antworten erscheinen hier auf der Leinwand.",
        "audience": {
          "kind": "text",
          "id": "abgegeben",
          "persist": true,
          "prompt": "Welche Aufgaben hast Du heute schon an KI abgegeben?",
          "placeholder": "Zum Beispiel: Protokolle zusammenfassen",
          "examples": [
            "Texte zusammenfassen",
            "E-Mails formulieren",
            "Recherche",
            "Tabellen auswerten",
            "Übersetzungen",
            "Code schreiben"
          ]
        },
        "app": "Freitext vom Handy, Antworten erscheinen live auf der Leinwand."
      }
    ],
    "n": 12
  },
  {
    "b": 3,
    "kind": "Überleitung",
    "title": "Wie hat die KI das geschafft?",
    "sub": "Und warum ist das noch nicht die Regel?",
    "panels": [
      {
        "at": "18:16",
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
              "Start",
              "22. Okt."
            ],
            [
              "Aktionsmärkte",
              "12"
            ],
            [
              "Rabatt",
              "15 %"
            ],
            [
              "Laufzeit",
              "4 Wochen"
            ]
          ]
        },
        "say": "Schauen wir noch einmal auf diese Antwort. Sieben Minuten, kein Mensch beteiligt. Wie hat die KI das geschafft? Und warum ist das noch nicht die Regel — warum ist Dein eigener KI-Assistent im Alltag so viel enttäuschender als das hier?"
      }
    ],
    "n": 13
  },
  {
    "b": 3,
    "kind": "Konzept",
    "title": "Wie arbeitet so ein Modell überhaupt?",
    "panels": [
      {
        "at": "18:17",
        "mock": {
          "t": "tshape",
          "variant": "human",
          "alt": "T-Form: ein breiter Balken für Allgemeinwissen, darunter ein tiefer Stamm für Spezialwissen",
          "caption": "Vereinfacht — aber so sieht Wissensarbeit aus: breit genug, um mit anderen Disziplinen zu reden, tief genug, um die eigene Aufgabe zu lösen."
        },
        "say": "Dafür müssen wir kurz verstehen, wie ein Modell arbeitet. Als Wissensarbeiter bringen wir in der Regel zweierlei mit. Erstens ein breites Allgemeinwissen — auch über die Disziplinen, mit denen wir zusammenarbeiten. Lisa weiß ungefähr, wie Logistik tickt und was eine Zweitplatzierung ist, auch wenn sie beides nicht selbst macht. Und zweitens das Spezialwissen, das sie braucht, um ihre eigene Aufgabe überhaupt bewältigen zu können. Hier etwas vereinfacht dargestellt."
      },
      {
        "at": "18:19",
        "mock": {
          "t": "tshape",
          "variant": "llm",
          "alt": "Das Modell hat einen viel breiteren und dickeren Balken an Allgemeinwissen, aber keinen Stamm an Spezialwissen",
          "caption": "Breiter und tiefer als bei uns — aber ohne Stamm."
        },
        "say": "Dieses Allgemeinwissen ist in der Regel gut dokumentiert und über das Internet abrufbar. Es ist also gut möglich, dass es bei heutigen KI-Modellen in den Trainingsdaten enthalten war. Und die Modelle haben davon mehr als wir: breiter und tiefer. Was ihnen fehlt, ist der Stamm. Das Spezialwissen, um die Aufgabe eines Category Managers wirklich auszuführen."
      }
    ],
    "n": 14
  },
  {
    "b": 3,
    "kind": "Interaktiv · Publikum",
    "title": "Machen wir die Probe.",
    "panels": [
      {
        "at": "18:21",
        "mock": {
          "t": "qr",
          "caption": "Schick die Mail — diesmal unverändert.",
          "hint": "Der erste, der eine Antwort bekommt, meldet sich bitte."
        },
        "say": "Machen wir die Probe. Auf Deinem Handy liegt wieder ein Link. Schick die Mail bitte ab — diesmal kannst Du den Text so lassen, wie er ist. Antworten wird ein Agent, der ausschließlich auf seine Trainingsdaten zugreifen kann. Keine Systeme, keine Daten. Der erste, der eine Antwort bekommt, meldet sich bitte.",
        "audience": {
          "kind": "mailto",
          "id": "lisa-blank",
          "persist": true,
          "until": "20:00",
          "label": "Mail abschicken (Text unverändert)",
          "to": "ecr2026-probe@carstenbkoch.de",
          "subject": "Listungsanfrage",
          "body": "Guten Tag Frau Berger,\n\nwir möchten ein neues Produkt bei Ihnen listen und schlagen einen Start zum kommenden Quartalswechsel vor. Über eine Rückmeldung würden wir uns freuen.\n\nMit freundlichen Grüßen",
          "hint": "Diesmal bitte nichts ändern — wir wollen sehen, was ein Agent ohne Systemzugriff daraus macht.",
          "privacy": "Ich speichere Deine E-Mail-Adresse nur, bis die Antwort versendet ist. Ich hebe sie nicht auf."
        },
        "app": "Agent ohne Tools und ohne Systemprompt-Kontext. Die Antwort enthält nur das Ergebnis plus die Schrittfolge, wie er dorthin kam."
      },
      {
        "at": "18:23",
        "mock": {
          "t": "statement",
          "text": "Wie ein hochmotivierter Abiturient.",
          "after": "Er will unbedingt antworten. Er kann es nur nicht."
        },
        "say": "Das dauert jetzt ein paar Minuten — die Mail muss verarbeitet und zurückgeschickt werden. Nutzen wir die Zeit für ein Bild: Stell Dir einen Abiturienten vor. Hochmotiviert, klug, liest schnell. Aber er war noch nie in Deinem Unternehmen. Er kennt Deine Kategorievorgaben nicht, Deine Lieferanten nicht, Deinen Regalplatz nicht. Und trotzdem will er unbedingt eine Antwort geben."
      },
      {
        "at": "18:25",
        "mock": {
          "t": "chat",
          "app": "Agent — nur Trainingsdaten",
          "msgs": [
            {
              "who": "Hersteller",
              "role": "user",
              "text": "Wir möchten ein neues Produkt listen. Start zum Quartalswechsel."
            },
            {
              "who": "Agent",
              "role": "agent",
              "flat": true,
              "text": "Vielen Dank für Ihre Anfrage. Eine Listung zum Quartalswechsel ist grundsätzlich möglich. Üblicherweise liegt die Marge in dieser Kategorie bei etwa 35 Prozent, und ein Vorlauf von sechs Wochen ist ausreichend. Wir melden uns mit den Konditionen."
            }
          ]
        },
        "say": "Schauen wir uns die Antworten an. Wer hat eine bekommen? — Und jetzt der interessante Teil: Vergleicht sie miteinander. Wenn mehrere von Euch sehr unterschiedliche Zahlen bekommen haben, dann habt Ihr gerade eine Halluzination gesehen. Das Modell hat keine Marge geprüft. Es hat eine plausibel klingende erfunden, weil Antworten seine Aufgabe ist.",
        "inter": "Antworten vergleichen lassen: „Wer hat eine bekommen? Was steht bei Dir für eine Marge drin?“"
      }
    ],
    "n": 15
  },
  {
    "b": 3,
    "kind": "Konzept",
    "title": "Was dem Agenten fehlt.",
    "panels": [
      {
        "at": "18:28",
        "mock": {
          "t": "tshape",
          "variant": "grown",
          "capabilities": [
            "Systemprompt — wer bin ich, was gilt hier",
            "Tools und Memory — woher kommen die Daten",
            "Autonomie — was darf ich selbst tun"
          ],
          "alt": "Derselbe breite Balken, und der Stamm wächst zurück: Systemprompt, Tools und Memory, Autonomie",
          "caption": "Drei Wege, auf denen das Spezialwissen hereinkommt."
        },
        "say": "Was braucht er also? Drei Dinge. Erstens einen Systemprompt: wer bin ich, für wen arbeite ich, welche Regeln gelten hier. Zweitens Tools und Memory: einen Weg, an die Daten zu kommen — und einen Weg, sich zu merken, was er dabei gelernt hat. Und drittens Autonomie: die Berechtigung, Dinge nicht nur vorzuschlagen, sondern zu tun. Aus dem Rechteck wird wieder ein T. Die drei gehen wir jetzt einzeln durch."
      }
    ],
    "n": 16
  },
  {
    "b": 3,
    "kind": "Stufe 1 · Systemprompt",
    "title": "Der Systemprompt",
    "panels": [
      {
        "at": "18:31",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "Wer bin ich",
              "Assistent von Lisa Berger, Category Management Schokolade & Pralinen bei Nordkorb"
            ],
            [
              "Was gilt hier",
              "Marge mindestens 30 %, Regalplatz knapp, Aktionsflächen vier Wochen Vorlauf"
            ],
            [
              "Wie arbeite ich",
              "Zusammenfassen, prüfen, empfehlen — und nachfragen statt raten"
            ],
            [
              "Was ich nicht habe",
              "Keinen Zugriff auf die Systeme. Das sage ich auch."
            ]
          ]
        },
        "say": "Der Systemprompt ist die Einarbeitung. Er kommt vor der ersten Nachricht und bleibt bei jeder weiteren dabei. Hier steht, wer der Agent ist, für wen er arbeitet und welche Regeln in diesem Haus gelten. Und — das ist der wichtigste Teil — hier steht auch, was er nicht weiß. Ein Agent, der sagt „diese Zahl habe ich nicht, sie steht in der Warenwirtschaft“, ist deutlich nützlicher als einer, der sie erfindet."
      },
      {
        "at": "18:33",
        "mock": {
          "t": "qr",
          "caption": "Starte den Chat.",
          "hint": "Der Agent hat jetzt den Systemprompt — aber immer noch keine Systeme. Die Tools bist Du."
        },
        "say": "Jetzt Du. Auf Deinem Handy kannst Du einen Chat starten. Wir simulieren, dass Du die Mail von Hallbach bekommen hast. Der Agent fasst nicht nur zusammen, er gibt eine Handlungsempfehlung — und er deutet an, was er tun würde, wenn er die Tools selbst hätte. Hat er aber nicht. Also fragt er Dich. Bitte antworte ihm. Und schau Dir den Systemprompt an, er ist in der App einsehbar.",
        "audience": {
          "kind": "chat",
          "id": "systemprompt-chat",
          "persist": true,
          "label": "Chat starten",
          "hint": "Du bekommst die Mail von Hallbach. Der Agent fragt Dich nach den Daten, die ihm fehlen — die Tools bist Du.",
          "systemPrompt": "Du bist der Assistent von Lisa Berger, Category Managerin für Schokolade & Pralinen bei der Lebensmittelkette Nordkorb.\n\nDeine Aufgabe: eingehende E-Mails von Herstellern einordnen und den Vorgang so weit abschließen, wie du kannst.\n\nKontext, den du kennst:\n- Kategorievorgabe Marge: mindestens 30 %\n- Regalplatz ist knapp. Eine Neulistung setzt in der Regel eine Auslistung voraus.\n- Aktionsflächen laufen über den Aktionskalender, Vorlauf mindestens vier Wochen.\n- Exklusivzusagen brauchen die Freigabe der Einkaufsleitung.\n\nSo arbeitest du:\n1. Fasse zusammen, worum es geht — Produkt, Konditionen, Termin, Besonderheiten.\n2. Leite ab, welche Angaben du für eine Entscheidung brauchst und in welchem System sie stehen.\n3. Beschaffe diese Angaben mit den Werkzeugen, die dir zur Verfügung stehen. Nutze alle, die etwas beitragen, und arbeite den Vorgang so vollständig ab, wie deine Berechtigungen es zulassen.\n4. Steht dir für eine Angabe kein Werkzeug zur Verfügung, dann frage Lisa danach. Benenne genau, welche Zahl du brauchst und wo sie zu finden ist.\n5. Gib eine Empfehlung ab und sage dazu, worauf sie sich stützt und was du selbst geprüft hast.\n6. Halte dich kurz. Deine Antwort wird auf einem Handy gelesen: ein kurzer Absatz, bei Bedarf drei Stichpunkte.\n\nUnverhandelbar: Erfinde keine Zahlen. Eine Angabe, die du weder beschafft noch erfragt hast, existiert für dich nicht. Lieber eine Rückfrage als ein plausibler Wert.",
          "suggestions": [
            "Die Kategorie wächst um 3,2 %",
            "Underperformer ist Nocturne Mini mit −12 %",
            "Regalplatz gibt es nur, wenn etwas ausgelistet wird",
            "Die Marge läge bei 31,1 %"
          ]
        },
        "app": "Chat mit Systemprompt, ohne Tools. Das Gespräch beginnt mit der Mail von Hallbach aus Abschnitt 2. Antwortvorschläge zum Antippen, damit niemand lange tippen muss. Der Systemprompt ist einsehbar — es ist derselbe, mit dem der Agent läuft."
      }
    ],
    "n": 17
  },
  {
    "b": 3,
    "kind": "Technik",
    "title": "Jede Nachricht schickt das ganze Gespräch mit.",
    "panels": [
      {
        "at": "18:36",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "Turn 1",
              "Systemprompt + Deine Frage"
            ],
            [
              "Turn 2",
              "Systemprompt + Deine Frage + seine Antwort + Deine nächste Frage"
            ],
            [
              "Turn 3",
              "…und so weiter. Der Verlauf wächst mit jeder Nachricht."
            ]
          ]
        },
        "say": "Eine Sache, die kaum jemand weiß: Wenn Du mit einem Modell sprichst, geht nicht nur Deine letzte Nachricht hin. Der gesamte bisherige Verlauf wird jedes Mal mitgeschickt — Systemprompt, alle Fragen, alle Antworten. Das Modell hat kein Gedächtnis. Es bekommt bei jedem Aufruf das ganze Gespräch neu vorgelegt."
      },
      {
        "at": "18:38",
        "mock": {
          "t": "diff",
          "before": {
            "h": "Frage für Frage · 7 Aufrufe",
            "n": "4.687",
            "sub": "Eingabe-Token · 2,1 Cent",
            "p": "Sechs Rückfragen, eine Empfehlung. 3.799 Token kommen aus dem Cache — und es bleibt teurer."
          },
          "after": {
            "h": "Alles in einer Nachricht · 1 Aufruf",
            "n": "600",
            "sub": "Eingabe-Token · 0,9 Cent",
            "p": "Dieselben Angaben, dieselbe Empfehlung. Nur einmal übertragen."
          },
          "foot": "Opus 4.8, mit Caching · 3 Runden 1,6-mal · 6 Runden 2,3-mal · 12 Runden 3,8-mal · 20 Runden 6,0-mal"
        },
        "say": "Und das hat direkte Folgen. Wir haben beides durchgerechnet, mit genau dem Systemprompt und genau der Mail, die Du eben gesehen hast, auf dem größten Modell. Links: sechs Rückfragen, dann die Empfehlung. Sieben Aufrufe, viertausendsiebenhundert Eingabe-Token. Rechts: alles gleich mitgegeben. Ein Aufruf, sechshundert. Jetzt kommt ein berechtigter Einwand: Es gibt Caching. Was schon einmal durchgelaufen ist, kostet beim nächsten Mal ein Zehntel. Stimmt, und es ist hier eingerechnet — dreitausendachthundert von den viertausendsiebenhundert Token kommen aus dem Cache. Der Abstand schrumpft von vier auf gut zwei. Er verschwindet aber nicht, und der Grund ist der interessante Teil: Gecacht wird nur, was hineingeht. Die sechs Rückfragen selbst sind das, was herauskommt, und Ausgabe wird nie gecacht. Allein die sechs Fragen kosten links mehr als der ganze rechte Lauf.",
        "note": "Zahlen aus packages/presentation/scripts/kostenrechnung.ts — pnpm --filter @ecr-talk/presentation kosten. Claude Opus 4.8 auf Bedrock: 5 Dollar je Million Eingabe, 25 Ausgabe, 0,50 je Million Cache-Treffer. Mit Fünf-Minuten-Caching. Ohne Caching wären es 3,7 gegen 0,9 Cent, also das 4,1-fache. Falls jemand nach der Lebensdauer fragt: der Fünf-Minuten-Cache setzt voraus, dass Lisa binnen fünf Minuten antwortet — tut sie das nicht, ist der Verlauf kalt und es gilt wieder die Rechnung ohne Caching. Die Stundenvariante kostet im Schreiben das Doppelte und landet bei 2,5 Cent. Auf Sonnet 4.6 sind alle Verhältnisse identisch, die Beträge rund 40 Prozent niedriger."
      }
    ],
    "n": 18
  },
  {
    "b": 3,
    "kind": "Stufe 2 · Tools",
    "title": "Tools",
    "panels": [
      {
        "at": "18:41",
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
                "outlook.lies_mails",
                "warenwirtschaft.kategorie",
                "marktdaten.segment",
                "regalplanung.platz",
                "aktionskalender.zeitraum"
              ],
              "text": "Kategorie wächst +3,2 %. Underperformer: Nocturne Mini (−12 %). Regalplatz frei, wenn Nocturne Mini geht. Rohertrag 31,1 % — über Vorgabe, aber nur mit gut einem Punkt Luft. Und: Am 22. Oktober werden in 12 Hamburger Märkten Aufsteller frei. Der Entwurf liegt in deinem E-Mail-Postfach."
            }
          ]
        },
        "say": "Jetzt bekommt er Werkzeuge. Und ehrlich gesagt hatte er von Anfang an eines: das Lesen Deiner E-Mails. Ohne das hätte er die Mail von Hallbach gar nicht gesehen. Jetzt kommen die Systeme dazu — Warenwirtschaft, Marktdaten, Regalplanung, Aktionskalender. Er fragt nicht mehr Dich. Er schaut selbst nach. Und am Ende sagt er den Satz, auf den es ankommt: Der Entwurf liegt in deinem E-Mail-Postfach."
      },
      {
        "at": "18:44",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "Ein Tool ist eine Beschreibung",
              "Name, wozu es gut ist, welche Angaben es braucht — in Worten, nicht in Code"
            ],
            [
              "Die Beschreibung wandert in die Instruktionen",
              "Das Modell liest sie wie einen Teil seines Auftrags und entscheidet selbst, wann es zugreift"
            ],
            [
              "MCP ist die Steckdose dafür",
              "Ein gemeinsames Format, damit jedes System seine Werkzeuge anbieten kann, ohne dass der Agent umgebaut wird"
            ]
          ]
        },
        "say": "Wie funktioniert das technisch? Ein Tool ist zunächst nichts weiter als eine Beschreibung: wie heißt es, wozu ist es gut, welche Angaben braucht es. Diese Beschreibung wird Teil der Instruktionen, die das Modell bei jedem Aufruf bekommt. Es liest sie und entscheidet selbst, wann ein Zugriff sinnvoll ist. Und MCP — das Model Context Protocol — ist die Steckdose dafür: ein gemeinsames Format, damit jedes System seine Werkzeuge anbieten kann, ohne dass wir den Agenten jedes Mal umbauen."
      }
    ],
    "n": 19
  },
  {
    "b": 3,
    "kind": "Stufe 3 · Autonomie",
    "title": "Autonomie",
    "panels": [
      {
        "at": "18:47",
        "mock": {
          "t": "fan",
          "cells": [
            {
              "sys": "SAP",
              "act": "Bestellung angelegt",
              "qty": "Schreibrecht statt Leserecht"
            },
            {
              "sys": "Regalplanung",
              "act": "Planogramm geändert",
              "qty": "Auslistung inklusive"
            },
            {
              "sys": "Outlook",
              "act": "Mail versendet",
              "qty": "ohne Freigabe"
            },
            {
              "sys": "Teams",
              "act": "12 Marktleiter informiert",
              "qty": "ohne Rückfrage"
            }
          ]
        },
        "say": "Die letzte Stufe ist keine neue Technik. Es sind dieselben Tools — nur mit Schreibberechtigung. Bestellungen dürfen ausgesprochen werden. Aufträge dürfen angelegt werden. E-Mails dürfen raus. Das ist keine Frage des Modells mehr, das ist eine Frage der Handlungsvollmacht. Und damit sind wir wieder bei dem Szenario vom Anfang."
      },
      {
        "at": "18:49",
        "mock": {
          "t": "statement",
          "text": "Hat jemand eine Antwort bekommen, die falsch war?",
          "after": "Eine Empfehlung, bei der Du gesagt hättest: so nicht."
        },
        "say": "Und damit die Frage, auf die es jetzt ankommt: Hat jemand von Euch eine Antwort bekommen, bei der Ihr gesagt hättet — so nicht? Wo der Agent daneben lag? Genau da fängt die eigentliche Arbeit an.",
        "inter": "Antworten sammeln. Wenn niemand etwas hat: nach der Halluzination von vorhin fragen."
      }
    ],
    "n": 20
  },
  {
    "b": 3,
    "kind": "Architektur",
    "title": "So ist es gebaut.",
    "sub": "Ein Agent, zwei Eingänge, sechs simulierte Systeme.",
    "panels": [
      {
        "mock": {
          "t": "architektur",
          "alt": "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_lisa, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme."
        },
        "say": "Bevor wir weitergehen, einmal das ganze Bild — vereinfacht, aber nichts darin ist gelogen. Links kommt die E-Mail an. Sie geht durch SES in einem zweiten Konto, landet in S3, eine Meldung weckt eine Lambda, die die Rohmail liest. Rechts das Handy: da tippt jemand direkt. Zwei völlig verschiedene Wege — und sie laufen auf dasselbe zu. Das ist der Punkt: Es ist EIN Agent. Ein Modell, ein Systemprompt, eine Konfiguration.",
        "app": "Stufe 1 — Eingänge und Agent. Werkzeuge und Systeme noch abgeblendet."
      },
      {
        "mock": {
          "t": "architektur",
          "alt": "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_lisa, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme."
        },
        "say": "Was ihn unterscheidet, ist einzig, womit er antworten darf. Kommt der Vorgang per Mail, hat er ein Werkzeug zum Mailversand. Kommt er aus dem Chat, hat er eines für den Chat. Und im Mailweg hat er noch eines: frage_lisa. Das ist kein gewöhnliches Werkzeug — es hält den Agenten an. Mitten im Vorgang. Er wartet, bis ein Mensch geantwortet hat, und rechnet dann mit dieser Antwort weiter.",
        "app": "Stufe 2 — die drei Werkzeuge. Der Pfeil zum Operator zeigt, wo die Rückfrage landet."
      },
      {
        "mock": {
          "t": "architektur",
          "alt": "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_lisa, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme."
        },
        "say": "Und links stehen die Systeme, in denen er nachschlägt. Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation, Aktionskalender, Listung. Die sind für heute Abend simuliert — das sage ich deutlich, und es steht auch unten auf dem Bild. Was nicht simuliert ist: welches dieser Systeme er befragt, in welcher Reihenfolge, und was er aus den Antworten schließt. Das entscheidet er.",
        "app": "Stufe 3 — die simulierten Systeme. Vollbild."
      }
    ],
    "n": 21
  },
  {
    "b": 3,
    "kind": "Memory · Vorgehen",
    "title": "Wie wird der Agent besser?",
    "panels": [
      {
        "at": "18:51",
        "mock": {
          "t": "list",
          "ordered": true,
          "items": [
            [
              "Jede Mail durch den Agenten schicken",
              "Auch die, die Du selbst beantworten würdest. Sonst lernt er nur die Hälfte."
            ],
            [
              "Seinen Vorschlag nicht einfach annehmen",
              "Rückfragen stellen, korrigieren, anders formulieren"
            ],
            [
              "Das ist die Rückkopplung",
              "Aus jeder Korrektur wird Wissen, das beim nächsten Mal schon da ist"
            ]
          ]
        },
        "say": "Der Weg dahin ist unspektakulär, und genau deshalb funktioniert er. Du schickst ab sofort jede eingehende Mail durch den Agenten — auch die, die Du in dreißig Sekunden selbst beantwortet hättest. Und Du antwortest nicht mehr selbst. Du lässt ihn einen Vorschlag machen. Und dann nimmst Du den nicht einfach an: Du fragst zurück, Du korrigierst, Du formulierst um. Das ist die Rückkopplung."
      },
      {
        "at": "18:53",
        "mock": {
          "t": "tshape",
          "variant": "grown",
          "capabilities": [
            "Systemprompt — bleibt gleich",
            "Tools — bleiben gleich",
            "Memory — wächst mit jeder Korrektur"
          ],
          "alt": "Der Stamm des T wächst weiter: Memory kommt neben Systemprompt und Tools dazu",
          "caption": "Memory ist der Teil, der nicht von Dir geschrieben wird, sondern entsteht."
        },
        "say": "Hier kommt Memory ins Spiel. Neben dem Systemprompt, den Du schreibst, und den Tools, die Du anschließt, sammelt der Agent zusätzliches Wissen: was Du korrigiert hast, worauf Du Wert legst, welche Formulierung durchgeht und welche nicht. Der Systemprompt ist das, was Du ihm sagst. Memory ist das, was er aus der Zusammenarbeit mitnimmt."
      },
      {
        "at": "18:55",
        "mock": {
          "t": "list",
          "ordered": true,
          "items": [
            [
              "Bis die Vorschläge stimmen",
              "Irgendwann ist die Mail, die er schicken will, die, die Du geschickt hättest"
            ],
            [
              "Dann in Software überführen",
              "Mit einer Bestätigungshürde: er darf, aber Du klickst"
            ],
            [
              "Und irgendwann die Hürde weglassen",
              "Aber nur für diese eine Klasse von Mails. Dann die nächste."
            ]
          ]
        },
        "say": "Und irgendwann kommst Du an den Punkt, an dem die Mail, die der Agent schicken will, die ist, die Du geschickt hättest. Dann überführst Du das in Software — erst mit einer Bestätigungshürde: Er darf handeln, aber Du klickst. Und wenn das eine Weile gut geht, nimmst Du die Hürde weg. Wichtig: Das gilt immer nur für eine Klasse von Mails. Listungsanfragen zum Beispiel. Dann nimmst Du Dir die nächste Klasse vor. So wächst das, Stück für Stück."
      }
    ],
    "n": 22
  },
  {
    "b": 3,
    "kind": "Rahmen",
    "title": "Und was sagt der EU AI Act dazu?",
    "panels": [
      {
        "at": "18:56",
        "mock": {
          "t": "list",
          "ordered": false,
          "items": [
            [
              "Risikobasiert",
              "Nicht jede KI ist gleich reguliert. Entscheidend ist, wofür sie eingesetzt wird."
            ],
            [
              "Transparenz",
              "Wo ein Agent nach außen kommuniziert, muss erkennbar sein, dass eine Maschine beteiligt ist."
            ],
            [
              "Nachvollziehbarkeit",
              "Was der Agent getan hat und warum, muss dokumentiert sein — genau das, was wir eben Schrittfolge genannt haben."
            ]
          ]
        },
        "say": "Ein Punkt, den Du im Haus früh klären solltest: der EU AI Act. Er reguliert risikobasiert — es kommt also nicht auf die Technik an, sondern darauf, wofür Du sie einsetzt. Zwei Dinge sind für unser Beispiel relevant. Erstens Transparenz: Wenn ein Agent nach außen kommuniziert, sollte erkennbar sein, dass eine Maschine beteiligt war. Und zweitens Nachvollziehbarkeit — was hat er getan und warum. Das ist genau die Schrittfolge, die Du heute in der Antwort-Mail bekommen hast. Ich bin kein Jurist; hol Dir das früh ins Haus statt am Ende.",
        "open": "Vor dem Vortrag juristisch gegenprüfen lassen. Die Aussagen sind bewusst allgemein gehalten — keine Rechtsberatung."
      }
    ],
    "n": 23
  },
  {
    "b": 4,
    "kind": "Auflösung",
    "title": "Braucht man uns dann noch?",
    "hero": true,
    "panels": [
      {
        "at": "18:57",
        "mock": {
          "t": "statement",
          "text": "Ja. Aber nicht so wie heute."
        },
        "say": "Damit sind wir zurück bei der Frage vom Anfang. Braucht man uns dann noch? Meine Antwort ist ja. Aber nicht so wie heute."
      }
    ],
    "n": 24
  },
  {
    "b": 4,
    "kind": "Kernsatz",
    "title": "Wir sind nicht mehr die Ausführenden.",
    "panels": [
      {
        "at": "18:58",
        "mock": {
          "t": "statement",
          "text": "Wir bauen die Rahmenbedingungen, damit ausgeführt werden kann."
        },
        "say": "Was Du heute Abend gesehen hast: Die KI kann erstaunlich viel — wenn man ihr die Rahmenbedingungen gibt. Und genau das ist unsere neue Aufgabe. Wir sind nicht mehr die, die ausführen. Wir sind die, die den Rahmen bauen, in dem ausgeführt werden kann. Aus dem operativ arbeitenden Mitarbeiter wird jemand, der Agenten anleitet."
      },
      {
        "at": "18:58",
        "mock": {
          "t": "statement",
          "text": "Die Arbeit wird nicht weniger.",
          "after": "Sie wird anders."
        },
        "say": "Und mach Dir keine Hoffnung, dass dabei Arbeit übrig bleibt. Sobald wir mehr schaffen, wird auch mehr erwartet — von Kunden, von Kollegen, vom eigenen Haus. Die Arbeit wird nicht weniger. Sie wird anders."
      }
    ],
    "n": 25
  },
  {
    "b": 4,
    "kind": "Handlung",
    "title": "Was Du damit anfangen kannst.",
    "panels": [
      {
        "at": "18:59",
        "mock": {
          "t": "list",
          "ordered": true,
          "items": [
            [
              "Schick jede E-Mail durch einen Agenten",
              "Amazon Quick — ohne dass Du dafür etwas bauen musst"
            ],
            [
              "Schärfe seine Instruktionen",
              "Wer bin ich, für wen arbeite ich, welche Ziele verfolge ich, was gilt hier"
            ],
            [
              "Häng Deine Systeme an",
              "Tools für SAP und die anderen — über MCP, ohne den Agenten umzubauen"
            ],
            [
              "Memory musst Du nicht bauen",
              "Das macht Quick von allein — es lernt aus Deinen Korrekturen mit"
            ],
            [
              "Überführe eine Klasse in Software",
              "Amazon Bedrock für die Modelle, Bedrock AgentCore als Infrastruktur für autonome Agenten"
            ]
          ]
        },
        "say": "Fassen wir zusammen, was Du damit anfangen kannst — und womit. Erstens: Schick ab morgen jede eingehende E-Mail durch einen Agenten. Dafür musst Du nichts bauen, das kann Amazon Quick heute schon. Zweitens: Schärfe seine Instruktionen. Wer bin ich, für wen arbeite ich, welche Ziele verfolge ich, was gilt in diesem Haus. Drittens: Häng Deine Systeme an — Tools für SAP und alles andere, über MCP, ohne den Agenten jedes Mal umzubauen. Viertens: Memory musst Du gar nicht selbst bauen, das macht Quick von allein; es lernt aus Deinen Korrekturen mit. Und fünftens, wenn eine Klasse von Vorgängen sitzt: Überführe sie in Software. Dafür gibt es Amazon Bedrock für die Modelle und Bedrock AgentCore als Infrastruktur für Agenten, die autonom laufen sollen.",
        "note": "Produktnamen vor dem Vortrag gegen den aktuellen Stand prüfen — AWS benennt schnell um."
      }
    ],
    "n": 26
  },
  {
    "b": 4,
    "kind": "Abschluss",
    "title": "Morgen früh, 8:00 Uhr.",
    "sub": "„Was funktioniert, was nicht — KI-Erfahrungen unter Entscheidern“ · 17. September, 8:00–8:45 Uhr",
    "panels": [
      {
        "at": "19:00",
        "mock": {
          "t": "statement",
          "text": "Komm und hör, was andere schon tun."
        },
        "say": "Und der letzte Punkt ist der einfachste: Komm morgen früh um acht zum Frühstück. Dort sitzen Entscheider aus anderen Häusern, die genau das gerade ausprobieren. Du hörst, was funktioniert — und vor allem, was nicht funktioniert. Das ist meistens der nützlichere Teil. Vielen Dank."
      }
    ],
    "n": 27
  }
] as Section[];

export const TOTAL = SECTIONS.length;

export function blockOf(n: number): Block {
  return BLOCKS[n - 1];
}

/** Panels eines Abschnitts; mindestens eines. */
export function panelsOf(index: number): number {
  return SECTIONS[index]?.panels.length ?? 1;
}
