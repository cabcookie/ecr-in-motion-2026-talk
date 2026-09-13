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
        "say": "Guten Tag. Schön, dass Sie hier sind. Lassen Sie uns nicht um den heißen Brei herumreden."
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
        "say": "Freitagnachmittag, kurz nach zwei. Bei Lisa Berger geht eine E-Mail ein. Andreas Walter von Hallbach Süßwaren will ein neues Produkt exklusiv einführen: Hallbach Crispy Bites. Einkaufspreis 2,89 Euro, empfohlener Verkaufspreis 4,49. Mindestabnahme 500 Verkaufseinheiten. Wunschtermin für den Start: der 15. Oktober. Rückmeldung bitte bis Ende nächster Woche.",
        "app": "Outlook-Oberfläche, aus 15 Metern lesbar."
      },
      {
        "at": "18:04",
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
        "at": "18:06",
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
        "at": "18:08",
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
        "say": "Kurz zu Lisa, denn um ihre Arbeit geht es hier. Lisa Berger ist Category Managerin bei einem großen Lebensmittelhändler und verantwortet die Kategorie Schokolade und Pralinen. Listungsentscheidungen, Auslistungen, Konditionen, Regalplatz, Aktionsplanung — das ist ihr Tagesgeschäft. Und der Agent, den Sie gerade gesehen haben, hat genau das getan, wofür sie bezahlt wird."
      },
      {
        "at": "18:10",
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
        "at": "18:12",
        "say": "Kein Mensch wurde gefragt. Alle wurden nur informiert."
      },
      {
        "at": "18:13",
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
    "kind": "Interaktiv · Publikum",
    "title": "Ich bin Carsten Koch.",
    "panels": [
      {
        "at": "18:14",
        "mock": {
          "t": "bio",
          "stations": [
            "Support",
            "Qualitätssicherung",
            "Projektmanagement",
            "Produkt- & Innovationsmanagement",
            "Vertrieb"
          ],
          "line": "Mit 11 zum ersten Mal programmiert. Seit über 25 Jahren in der IT."
        },
        "say": "Ich bin Carsten Koch, habe mit elf Jahren das erste Mal programmiert und arbeite seit über fünfundzwanzig Jahren in der IT: Support, Qualitätssicherung, Projektmanagement, Produkt- und Innovationsmanagement, Vertrieb. Ich liebe es, auszuprobieren — und Menschen und Unternehmen dabei zu helfen, ihre Produktivität zu steigern.",
        "audience": {
          "kind": "wait",
          "id": "willkommen",
          "message": "Gleich geht es los. Lassen Sie diese Seite offen."
        }
      },
      {
        "at": "18:16",
        "mock": {
          "t": "qr",
          "caption": "Das hier ist keine PowerPoint.",
          "hint": "Scannen Sie den Code und machen Sie mit."
        },
        "say": "Deshalb ist das hier auch keine PowerPoint-Präsentation, sondern eine Webanwendung. Und Sie können sie auf Ihrem eigenen Handy aufrufen. Scannen Sie bitte jetzt den QR-Code. Sie sehen dort etwas anderes als auf der Leinwand — nämlich genau die Stelle, an der wir gerade sind, und was Sie dazu beitragen können.",
        "audience": {
          "kind": "wait",
          "id": "bereit",
          "message": "Schön, dass Sie da sind. Gleich kommen zwei Fragen."
        }
      },
      {
        "at": "18:18",
        "mock": {
          "t": "results",
          "of": "sorge",
          "as": "matrix",
          "axes": {
            "x": "Beunruhigt Sie das?",
            "y": "Freuen Sie sich darauf?"
          }
        },
        "say": "Zwei Fragen an Sie, beide auf einmal. Erstens: Beunruhigt Sie das Beispiel von eben? Und zweitens: Freuen Sie sich darauf, dass es Realität wird? Die beiden schließen sich nicht aus — man kann beunruhigt sein und sich trotzdem freuen. Deshalb sehen Sie Ihre Antworten hier als Matrix, die sich nach und nach füllt.",
        "audience": {
          "kind": "poll",
          "id": "sorge",
          "persist": true,
          "questions": [
            {
              "id": "beunruhigt",
              "text": "Beunruhigt Sie dieses Beispiel?",
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
              "text": "Freuen Sie sich darauf, dass es Realität wird?",
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
        "at": "18:21",
        "mock": {
          "t": "qr",
          "caption": "Schreiben Sie Lisa selbst.",
          "hint": "Der Link öffnet Ihr Mailprogramm. Ändern Sie den Text — bauen Sie Ihr eigenes Szenario."
        },
        "say": "Und jetzt die Einladung, es selbst auszuprobieren. Auf Ihrem Handy finden Sie einen Link, der Ihr Mailprogramm öffnet — mit einer vorbereiteten Nachricht an Lisa. Bitte ändern Sie den Text. Bauen Sie Ihr eigenes Szenario. Hinter dem Postfach wartet ein Agent, der Ihre Anfrage verarbeitet und Ihnen antwortet. In der Antwort finden Sie den Link zu dieser Präsentation, weiterführendes Material, die Liste der Aktionen, die der Agent ausgeführt hat — und den Link zur Code-Basis. Damit Sie sehen können: Die Systeme sind simuliert. Die Arbeit des Agenten ist es nicht. Der Link bleibt den ganzen Abend offen, Sie können das also auch später noch machen.",
        "audience": {
          "kind": "mailto",
          "id": "lisa-mail",
          "persist": true,
          "until": "20:00",
          "label": "Mail an Lisa öffnen",
          "to": "lisa.berger@example-retail.de",
          "subject": "Anfrage an das Category Management",
          "body": "Guten Tag Frau Berger,\n\nwir möchten ein neues Produkt bei Ihnen listen. Bitte passen Sie diesen Text an, um Ihr eigenes Szenario zu bauen.\n\nMit freundlichen Grüßen",
          "hint": "Ändern Sie den Text, bevor Sie senden. Der Agent antwortet Ihnen — mit dem, was er getan hat, und den Belegen dazu.",
          "privacy": "Ich speichere Ihre E-Mail-Adresse nur, bis die Antwort versendet ist. Ich hebe sie nicht auf."
        },
        "open": "Anmeldung über Google mit carsten.b.koch@gmail.com als einziger berechtigter Adresse fehlt noch — ohne sie sehen Teilnehmer dieselbe Ansicht wie die Leinwand."
      }
    ],
    "n": 5
  },
  {
    "b": 2,
    "kind": "Beleg",
    "title": "Ich bin damit nicht allein.",
    "panels": [
      {
        "at": "18:25",
        "mock": {
          "t": "quote",
          "text": "KI könnte die Hälfte aller Einstiegsjobs im Bürobereich vernichten und die Arbeitslosigkeit binnen ein bis fünf Jahren auf 10 bis 20 Prozent treiben.",
          "cite": "Dario Amodei · Anthropic · Mai 2025"
        },
        "say": "Mit dieser Sorge bin ich nicht allein. Dario Amodei, Mitgründer und Chef von Anthropic, hat im Mai 2025 genau das gesagt: Die Hälfte aller Einstiegsjobs im Bürobereich könnte verschwinden, die Arbeitslosigkeit auf zehn bis zwanzig Prozent steigen — binnen ein bis fünf Jahren. Im Februar dieses Jahres hat er das noch einmal bekräftigt. Das ist der Mann, der das Produkt verkauft. Und er warnt davor.",
        "note": "Quelle: Interview mit Jim VandeHei und Mike Allen, Axios, 28. Mai 2025. „White-collar bloodbath\" ist die Formulierung von Axios, nicht von Amodei."
      }
    ],
    "n": 6
  },
  {
    "b": 2,
    "kind": "Beleg",
    "title": "Aus demselben Haus kommt das Gegenteil.",
    "panels": [
      {
        "at": "18:27",
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
    "n": 7
  },
  {
    "b": 2,
    "kind": "Historie",
    "title": "Die Propheten vor ihm lagen falsch.",
    "panels": [
      {
        "at": "18:29",
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
    "n": 8
  },
  {
    "b": 2,
    "kind": "Daten",
    "title": "Und trotzdem hatten sie recht.",
    "sub": "Millionen Arbeitsplätze verschwanden tatsächlich.",
    "panels": [
      {
        "at": "18:31",
        "mock": {
          "t": "chart",
          "which": "agriculture"
        },
        "say": "Und jetzt der Teil, den man nicht wegdiskutieren sollte: Sie hatten ja recht. Die Jobs sind wirklich verschwunden. Die US-Landwirtschaft beschäftigte 1900 einundvierzig Prozent aller Erwerbstätigen. Im Jahr 2000 waren es zwei. Millionen von Arbeitsplätzen — weg. Nur: Eine dauerhafte Massenarbeitslosigkeit ist daraus nie geworden. Wenn Sie sich ansehen, wann die Arbeitslosenquote in Deutschland wirklich ausschlug — Weltwirtschaftskrise, Nachkriegszeit, Ölkrise, Wiedervereinigung — dann waren das Kriege und Wirtschaftskrisen. Keine einzige dieser Spitzen kam von einer neuen Technologie. Die Zahlen dazu schicke ich Ihnen mit der Antwort-Mail.",
        "note": "Die Arbeitsmarkt-Zeitreihe wird nur gesprochen und als Beleg in der Antwort-Mail mitgeschickt — sie braucht keine eigene Folie."
      }
    ],
    "n": 9
  },
  {
    "b": 2,
    "kind": "Konzept",
    "title": "Der Irrtum von der festen Menge Arbeit",
    "sub": "David Frederick Schloss prägte 1891 den Begriff der „Lump of Labor Fallacy\".",
    "panels": [
      {
        "at": "18:33",
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
    "n": 10
  },
  {
    "b": 2,
    "kind": "Interaktiv · Publikum",
    "title": "Welche Aufgaben haben Sie heute schon an KI abgegeben?",
    "panels": [
      {
        "at": "18:36",
        "mock": {
          "t": "results",
          "of": "abgegeben",
          "as": "list"
        },
        "say": "Und jetzt Sie noch einmal. Auf Ihrem Handy steht die Frage: Welche Aufgaben haben Sie heute schon an eine KI abgegeben, die Sie früher selbst gemacht haben? Schreiben Sie kurz mit. Ihre Antworten erscheinen hier auf der Leinwand.",
        "audience": {
          "kind": "text",
          "id": "abgegeben",
          "persist": true,
          "prompt": "Welche Aufgaben haben Sie heute schon an KI abgegeben?",
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
    "n": 11
  },
  {
    "b": 3,
    "kind": "Überleitung",
    "title": "Wie hat die KI das geschafft?",
    "sub": "Und warum ist das noch nicht die Regel?",
    "panels": [
      {
        "at": "18:41",
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
        "say": "Schauen wir noch einmal auf diese Antwort. Sieben Minuten, kein Mensch beteiligt. Wie hat die KI das geschafft? Und warum ist das noch nicht die Regel — warum ist Ihr eigener KI-Assistent im Alltag so viel enttäuschender als das hier?"
      }
    ],
    "n": 12
  },
  {
    "b": 3,
    "kind": "Überleitung",
    "title": "Es liegt nicht am Modell. Es liegt am Kontext.",
    "sub": "Genug Theorie. Wir bauen den Agenten jetzt in vier Stufen auf — von nutzlos bis autonom. Jede Stufe fügt genau einen Baustein hinzu.",
    "panels": [
      {
        "at": "18:42",
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
        "say": "Die Stufenübersicht bleibt als Orientierung während des ganzen Blocks abrufbar."
      }
    ],
    "n": 13
  },
  {
    "b": 3,
    "kind": "Chat · Stufe a",
    "title": "Stufe a) Ein nacktes Modell",
    "sub": "Dieselbe E-Mail. Kein Kontext. Die Aufgabe: „Bearbeite diesen Vorgang.“",
    "panels": [
      {
        "at": "18:43",
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
        "app": "Ein Chatfenster ohne jede Anbindung. Bewusst nackt — kein Branding, keine Tools."
      }
    ],
    "n": 14
  },
  {
    "b": 3,
    "kind": "Technik · Stufe a",
    "title": "Trainingsdaten",
    "sub": "Jedes große Sprachmodell wurde auf riesigen Textmengen trainiert. Das ist sein Allgemeinwissen — aber es kennt weder Ihre Firma noch Ihre Produkte noch Ihre Kunden.",
    "panels": [
      {
        "at": "18:44",
        "mock": {
          "t": "statement",
          "text": "Wie ein neuer Mitarbeiter am ersten Tag: intelligent, aber ahnungslos."
        },
        "say": "Das Bild vom neuen Mitarbeiter trägt durch den ganzen Block — später wieder aufgreifen."
      }
    ],
    "n": 15
  },
  {
    "b": 3,
    "kind": "Chat · Stufe b",
    "title": "Stufe b) „Da ist eine E-Mail für Dich“",
    "sub": "Dieselbe E-Mail — aber der Agent hat jetzt ein Briefing und einen aufgebauten Gesprächsverlauf.",
    "panels": [
      {
        "at": "18:45",
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
        "app": "Derselbe Chat, jetzt mit Systemprompt. Der Systemprompt sollte einblendbar sein — das Publikum will sehen, was drinsteht."
      }
    ],
    "n": 16
  },
  {
    "b": 3,
    "kind": "Technik · Stufe b",
    "title": "Systemprompt und Gesprächsverlauf",
    "panels": [
      {
        "at": "18:46",
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
        "say": "Das ist der Baustein, den fast niemand im Raum kennt. Zeit dafür nehmen."
      }
    ],
    "n": 17
  },
  {
    "b": 3,
    "kind": "Demo · Stufe b",
    "title": "Wir nehmen eine Nachricht aus dem Verlauf heraus.",
    "sub": "Dieselbe Frage, ein Turn weniger — und die Antwort ändert sich komplett.",
    "panels": [
      {
        "at": "18:47",
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
        "app": "Der Gesprächsverlauf muss editierbar sein — einzelne Turns sichtbar löschen und die Anfrage erneut absenden."
      }
    ],
    "n": 18
  },
  {
    "b": 3,
    "kind": "Chat · Stufe c",
    "title": "Stufe c) „…und hier ist ein Antwortentwurf“",
    "sub": "Dieselbe E-Mail — aber jetzt mit Zugriff auf die Systeme.",
    "panels": [
      {
        "at": "18:48",
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
        "app": "Tool-Aufrufe live und einzeln sichtbar — mit Name und Rückgabewert. Am Ende ein Antwortentwurf, den Lisa prüft und absendet."
      }
    ],
    "n": 19
  },
  {
    "b": 3,
    "kind": "Technik · Stufe c",
    "title": "Tools",
    "sub": "Bisher konnte der Agent nur reden. Durch Tools kann er Daten abrufen, Systeme abfragen und Entwürfe produzieren.",
    "panels": [
      {
        "at": "18:48",
        "mock": {
          "t": "statement",
          "text": "Er bereitet die Arbeit vor. Der Mensch entscheidet und klickt „Senden“."
        },
        "say": "Hier ist die Grenze zwischen c und d: Wer klickt „Senden“?"
      }
    ],
    "n": 20
  },
  {
    "b": 3,
    "kind": "Agent · Stufe d",
    "title": "Stufe d) Jetzt öffnen wir die Box.",
    "sub": "Dieselbe E-Mail, dieselben sieben Minuten wie zu Beginn — diesmal sehen wir zu.",
    "panels": [
      {
        "at": "18:49",
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
        "app": "Schrittweise steuerbar: nach jedem Tool-Aufruf anhaltbar, damit erklärt werden kann. Das ist der einzige Ablauf, der diese Steuerung wirklich braucht."
      }
    ],
    "n": 21
  },
  {
    "b": 3,
    "kind": "Auflösung · Stufe d",
    "title": "Und das ist die Antwort auf die Frage von vorhin.",
    "sub": "Niemand hat den Agenten gebeten, im Aktionskalender nachzusehen. Er hat es getan, weil ein Termin im Raum stand.",
    "panels": [
      {
        "at": "18:50",
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
        "app": "Aktionskalender mit auslaufenden Kampagnen und Display-/Regalplatzbestand je Markt. Beides fehlt heute im Datenmodell — das sind die beiden Tabellen, die diese Folie erzwingt."
      }
    ],
    "n": 22
  },
  {
    "b": 3,
    "kind": "Agent · Stufe d",
    "title": "Den Rest haben Sie schon gesehen.",
    "sub": "Gegenvorschlag, Bestätigung, vier Systeme. Genau wie am Anfang — nur wissen Sie jetzt, was davor passiert ist.",
    "panels": [
      {
        "at": "18:51",
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
        "say": "Schnell durchgehen. Die Wiederholung ist beabsichtigt, aber sie darf keine Zeit kosten."
      }
    ],
    "n": 23
  },
  {
    "b": 3,
    "kind": "Kernsatz",
    "title": "Der Kreis schließt sich.",
    "panels": [
      {
        "at": "18:52",
        "mock": {
          "t": "statement",
          "text": "Das ist das Szenario vom Anfang.",
          "after": "Der Mensch kommt erst hinterher ins Spiel — zur Kontrolle, nicht zur Ausführung."
        },
        "say": "Kurz zurück auf Block 1 verweisen. Das Publikum soll die Klammer merken."
      }
    ],
    "n": 24
  },
  {
    "b": 3,
    "kind": "Frage",
    "title": "Kann er das? Darf er das? Sollte er das?",
    "sub": "Das kennen wir eigentlich schon — es heißt automatische Disposition. Aber hier trifft der Agent komplexe Geschäftsentscheidungen: was gelistet wird, was weichen muss, wann der beste Zeitpunkt ist, welche Konditionen verhandelt werden.",
    "panels": [
      {
        "at": "18:53",
        "mock": {
          "t": "statement",
          "text": "Drei Fragen. Wir beantworten sie nicht — das Publikum tut es."
        },
        "say": "Bewusst offen lassen und ins Publikum geben. Das ist der Übergang in Block 4.",
        "inter": "„Was hat sich von Stufe zu Stufe verändert?“ · „Welche Aufgabe in Ihrem Alltag könnte so aussehen?“"
      }
    ],
    "n": 25
  },
  {
    "b": 3,
    "kind": "Interaktiv",
    "title": "Jetzt Sie.",
    "sub": "Die Teilnehmer schreiben an ein vorbereitetes Postfach. Dahinter wartet ein Agent, der die Nachricht verarbeitet und antwortet.",
    "panels": [
      {
        "at": "18:54",
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
        "open": "Zwei offene Punkte: Das Postfach ist technisch noch nicht vorbereitet, und die Platzierung im Block steht nicht fest — nach Stufe b oder als Abschluss nach Stufe d."
      }
    ],
    "n": 26
  },
  {
    "b": 4,
    "kind": "Auflösung",
    "title": "Braucht man uns dann noch?",
    "panels": [
      {
        "at": "18:55",
        "mock": {
          "t": "statement",
          "text": "Ja. Aber anders als heute."
        },
        "say": "Wörtlich die Frage aus Block 1 wiederholen — „uns“, gleiche Betonung. Wenn das Publikum sie wiedererkennt, hat der Bogen getragen."
      }
    ],
    "n": 27
  },
  {
    "b": 4,
    "kind": "Kernsatz",
    "title": "Wir sind nicht mehr die Ausführenden.",
    "sub": "KI kann gewaltig viel — wenn man ihr die richtigen Rahmenbedingungen gibt. Und genau das ist die neue Aufgabe.",
    "panels": [
      {
        "at": "18:56",
        "mock": {
          "t": "statement",
          "text": "Der operative Mitarbeiter wird zum Manager von KI-Agenten."
        },
        "say": "Das ist die eigentliche Botschaft des Vortrags. Alles davor führt hierhin."
      }
    ],
    "n": 28
  },
  {
    "b": 4,
    "kind": "Zitat",
    "title": "Und die Latte wird sofort höher gelegt.",
    "panels": [
      {
        "at": "18:57",
        "mock": {
          "t": "quote",
          "text": "Customers are always beautifully, wonderfully dissatisfied. Even if they report being happy.",
          "cite": "Jeff Bezos"
        },
        "say": "Kunden gewöhnen sich schnell. Sie werden wissen, dass KI im Hintergrund arbeitet — und mehr erwarten."
      }
    ],
    "n": 29
  },
  {
    "b": 4,
    "kind": "Kernsatz",
    "title": "Die Arbeit wird nicht weniger. Sie wird anders.",
    "sub": "Die Rahmenbedingungen aufzubauen ist kein Wochenendprojekt. Es ist eine Aufgabe, die uns Jahre beschäftigen wird.",
    "panels": [
      {
        "at": "18:58",
        "mock": {
          "t": "statement",
          "text": "Wer jetzt anfängt zu lernen, lernt schneller.",
          "after": "Wer schneller lernt, zieht schneller Nutzen — schneller als die Konkurrenz."
        },
        "say": "Der Grund, warum sie heute Abend hier sind. Das explizit sagen."
      }
    ],
    "n": 30
  },
  {
    "b": 4,
    "kind": "Handlung",
    "title": "Drei Dinge, die Sie morgen tun können.",
    "panels": [
      {
        "at": "18:58",
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
        "say": "Konkret bleiben. Punkt 3 ist die Brücke zur Folgeveranstaltung."
      }
    ],
    "n": 31
  },
  {
    "b": 4,
    "kind": "Abschluss",
    "title": "Morgen früh, 8:00 Uhr.",
    "sub": "„Was funktioniert, was nicht — KI-Erfahrungen unter Entscheidern“ · 17. September, 8:00–8:45 Uhr",
    "panels": [
      {
        "at": "18:59",
        "mock": {
          "t": "statement",
          "text": "Wer das Gespräch vertiefen will, ist herzlich eingeladen."
        },
        "say": "Ruhig ausklingen lassen.",
        "inter": "Offene Diskussion: „Was nehmen Sie von heute mit?“ · „Was wäre Ihr erster Schritt morgen?“"
      }
    ],
    "n": 32
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
