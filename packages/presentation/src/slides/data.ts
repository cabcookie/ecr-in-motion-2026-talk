// Quelle der Wahrheit für den Vortrag.
// Das Storyboard-Artefakt wird hieraus erzeugt: pnpm --filter @ecr-talk/docs storyboard

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
    "say": "Guten Tag. Schön, dass Sie hier sind. Lassen Sie uns nicht um den heißen Brei herumreden.",
    "n": 1
  },
  {
    "b": 1,
    "kind": "These",
    "headline": "KI wird uns unsere Jobs wegnehmen.",
    "say": "Das ist der Satz, um den es heute Abend geht. Ich lasse ihn erst einmal so stehen — und zeige Ihnen stattdessen ein Szenario, wie die Welt aussehen könnte.",
    "n": 2
  },
  {
    "b": 1,
    "kind": "Outlook · Black Box",
    "steps": 2,
    "headline": "Freitag, 14:12 Uhr.",
    "mock": {
      "t": "mailthread",
      "incoming": {
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
      "reply": {
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
      }
    },
    "sayByStep": [
      "Ein Szenario, wie die Welt aussehen könnte. Freitagnachmittag, kurz nach zwei. Bei Lisa Berger geht eine E-Mail ein. Andreas Walter von Hallbach Süßwaren will ein neues Produkt exklusiv einführen: Hallbach Crispy Bites. Einkaufspreis 2,89 Euro, empfohlener Verkaufspreis 4,49. Mindestabnahme 500 Verkaufseinheiten. Wunschtermin für den Start: der 15. Oktober. Rückmeldung bitte bis Ende nächster Woche.",
      "Keine sieben Minuten später geht diese Antwort raus. Wir können listen — aber nicht zum 15. Oktober, sondern eine Woche später, am 22. Der Grund: In zwölf Märkten im Raum Hamburg werden an diesem Tag Zweitplatzierungsflächen frei, die sich für eine Einführungsaktion nutzen lassen. Bedingung: fünfzehn Prozent Einführungsrabatt für die ersten vier Wochen. Und jetzt das Besondere: Kein Mensch war beteiligt. Ein KI-Agent hat die E-Mail analysiert, sich einen Plan gemacht, Daten aus den Systemen geholt, sie gegeneinandergestellt, ausgewertet, Entscheidungen getroffen, die Antwort formuliert und abgeschickt. Alles in sieben Minuten."
    ],
    "app": "Beide Mails in einer Outlook-Oberfläche, die zweite erst auf Klick. Aus 15 Metern lesbar.",
    "n": 3
  },
  {
    "b": 1,
    "kind": "Agent",
    "headline": "Hallbach sagt zu. Und dann läuft alles an.",
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
    "app": "Vier Systeme quittieren sichtbar. Die zwölf Marktleiter als echte Liste, nicht als Zahl.",
    "n": 4
  },
  {
    "b": 1,
    "kind": "Persona",
    "headline": "Das ist Lisa Berger.",
    "mock": {
      "t": "list",
      "ordered": false,
      "items": [
        [
          "Category Managerin",
          "bei einem großen Lebensmittelhändler"
        ],
        [
          "Kategorie",
          "Schokolade & Pralinen"
        ],
        [
          "Ihr Tagesgeschäft",
          "Listung, Auslistung, Konditionen, Regalplatz, Aktionen"
        ]
      ]
    },
    "say": "Kurz zu Lisa, denn um ihre Arbeit geht es hier. Lisa Berger ist Category Managerin bei einem großen Lebensmittelhändler und verantwortet die Kategorie Schokolade und Pralinen. Listungsentscheidungen, Auslistungen, Konditionen, Regalplatz, Aktionsplanung — das ist ihr Tagesgeschäft. Und der Agent, den Sie gerade gesehen haben, hat genau das getan, wofür sie bezahlt wird.",
    "n": 5
  },
  {
    "b": 1,
    "kind": "Kontrast",
    "headline": "Was Lisa dafür gebraucht hätte: einen Tag.",
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
    "say": "Wenn Lisa das selbst gemacht hätte, sähe ihr Tag so aus. Antrag lesen und verstehen. In der Warenwirtschaft nachsehen, wie die Kategorie läuft und wer der Underperformer ist. Marktdaten zum Segment prüfen. Regalplanung: Ist überhaupt Platz, und wer müsste weichen? Marge rechnen. In der Aktionsplanung nachsehen, ob es eine Gelegenheit gibt. Die Logistik fragen. Die Marktleiter informieren. Und am Ende die Rückmail schreiben. Acht Systeme, vier bis fünf Kollegen, ein ganzer Arbeitstag — wenn nichts dazwischenkommt.",
    "n": 6
  },
  {
    "b": 1,
    "kind": "Kernsatz",
    "steps": 2,
    "headline": "Kein Mensch wurde gefragt.",
    "mock": {
      "t": "reveal",
      "items": [
        {
          "text": "Alle wurden nur informiert."
        },
        {
          "text": "Braucht man uns dann noch?",
          "sub": "uns = Wissensarbeiter",
          "accent": true
        }
      ]
    },
    "sayByStep": [
      "Kein Mensch wurde gefragt. Alle wurden nur informiert.",
      "Und damit die Frage, um die es heute Abend geht: Braucht man uns dann noch? Mit uns meine ich Wissensarbeiter. Menschen, die mit Informationen arbeiten — lesen, prüfen, abwägen, entscheiden, schreiben. Genau das, worin generative KI stark ist. Nicht Muskelkraft, nicht Feinmotorik. Informationsarbeit."
    ],
    "n": 7
  },
  {
    "b": 1,
    "kind": "Interaktiv · Publikum",
    "steps": 4,
    "headline": "Kurz zu mir.",
    "mock": {
      "t": "stepped",
      "frames": [
        {
          "t": "bio",
          "stations": [
            "Support",
            "Qualitätssicherung",
            "Projektmanagement",
            "Produkt- & Innovationsmanagement",
            "Vertrieb"
          ],
          "line": "Über 20 Jahre IT — und mit 11 zum ersten Mal programmiert."
        },
        {
          "t": "qr",
          "caption": "Das hier ist keine PowerPoint.",
          "hint": "Scannen Sie den Code und machen Sie mit."
        },
        {
          "t": "results",
          "of": "sorge",
          "as": "matrix",
          "axes": {
            "x": "Beunruhigt Sie das?",
            "y": "Freuen Sie sich darauf?"
          }
        },
        {
          "t": "qr",
          "caption": "Schreiben Sie Lisa selbst.",
          "hint": "Der Link öffnet Ihr Mailprogramm. Ändern Sie den Text — bauen Sie Ihr eigenes Szenario."
        }
      ]
    },
    "sayByStep": [
      "Bevor wir weitermachen, kurz zu mir. Über zwanzig Jahre IT: Support, Qualitätssicherung, Projektmanagement, Produkt- und Innovationsmanagement, Vertrieb. Mit elf habe ich das erste Mal programmiert — und deshalb probiere ich bis heute gern selbst aus, was mit neuer Technologie geht.",
      "Deshalb ist das hier auch keine PowerPoint-Präsentation, sondern eine Webanwendung. Und Sie können sie auf Ihrem eigenen Handy aufrufen. Ich lade Sie herzlich dazu ein: Scannen Sie bitte jetzt den QR-Code. Sie sehen dort etwas anderes als auf der Leinwand — nämlich genau die Stelle, an der wir gerade sind, und was Sie dazu beitragen können.",
      "Zwei Fragen an Sie. Erstens: Beunruhigt Sie das Beispiel von eben? Und zweitens: Freuen Sie sich darauf, dass es Realität wird? Die beiden schließen sich nicht aus — man kann beunruhigt sein und sich trotzdem freuen. Deshalb sehen Sie Ihre Antworten hier als Matrix.",
      "Und jetzt die Einladung, es selbst auszuprobieren. Auf Ihrem Handy finden Sie einen Link, der Ihr Mailprogramm öffnet — mit einer vorbereiteten Nachricht an Lisa. Bitte ändern Sie den Text. Bauen Sie Ihr eigenes Szenario. Hinter dem Postfach wartet ein Agent, der Ihre Anfrage verarbeitet und Ihnen antwortet. In der Antwort finden Sie den Link zu dieser Präsentation, weiterführendes Material, die Liste der Aktionen, die der Agent ausgeführt hat — und den Link zur Code-Basis. Damit Sie sehen können: Die Systeme sind simuliert. Die Arbeit des Agenten ist es nicht. Nehmen Sie sich in Ruhe die Zeit."
    ],
    "audience": [
      {
        "kind": "wait",
        "id": "willkommen",
        "message": "Gleich geht es los. Lassen Sie diese Seite offen."
      },
      {
        "kind": "wait",
        "id": "bereit",
        "message": "Schön, dass Sie da sind. Die erste Frage kommt gleich."
      },
      {
        "kind": "poll",
        "id": "sorge",
        "question": {
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
        }
      },
      {
        "kind": "mailto",
        "id": "lisa-mail",
        "label": "Mail an Lisa öffnen",
        "to": "lisa.berger@example-retail.de",
        "subject": "Anfrage an das Category Management",
        "body": "Guten Tag Frau Berger,\n\nwir möchten ein neues Produkt bei Ihnen listen. Bitte passen Sie diesen Text an, um Ihr eigenes Szenario zu bauen.\n\nMit freundlichen Grüßen",
        "hint": "Ändern Sie den Text, bevor Sie senden. Der Agent antwortet Ihnen."
      }
    ],
    "open": "Die zweite Frage („Freuen Sie sich darauf?\") braucht einen eigenen Klick-Schritt, sobald die Matrix steht. Anmeldung über Google mit carsten.b.koch@gmail.com als einziger berechtigter Adresse ist noch nicht gebaut — ohne sie sehen Teilnehmer dieselbe Ansicht wie die Leinwand.",
    "app": "QR-Code auf die Zuschauersicht, Live-Matrix der Antworten, Mail-Link mit vorformuliertem Text.",
    "n": 8
  },
  {
    "b": 2,
    "kind": "Beleg",
    "headline": "Ich bin damit nicht allein.",
    "mock": {
      "t": "quote",
      "text": "KI könnte die Hälfte aller Einstiegsjobs im Bürobereich vernichten und die Arbeitslosigkeit binnen ein bis fünf Jahren auf 10 bis 20 Prozent treiben.",
      "cite": "Dario Amodei · Anthropic · Mai 2025"
    },
    "say": "Und mit dieser Sorge bin ich nicht allein. Dario Amodei, Mitgründer und Chef von Anthropic, hat im Mai 2025 genau das gesagt: Die Hälfte aller Einstiegsjobs im Bürobereich könnte verschwinden, die Arbeitslosigkeit auf zehn bis zwanzig Prozent steigen — binnen ein bis fünf Jahren. Im Februar dieses Jahres hat er das noch einmal bekräftigt. Das ist der Mann, der das Produkt verkauft. Und er warnt davor.",
    "note": "Quelle: Interview mit Jim VandeHei und Mike Allen, Axios, 28. Mai 2025. „White-collar bloodbath\" ist die Formulierung von Axios, nicht von Amodei — nicht als sein Zitat wiedergeben.",
    "n": 9
  },
  {
    "b": 2,
    "kind": "Beleg",
    "headline": "Aus demselben Haus kommt das Gegenteil.",
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
    "say": "Claude Code ist ein Produkt von Anthropic — derselben Firma. Und der Erfinder von Claude Code zeichnet hier ein ganz anderes Bild. Jemand muss die Modelle anleiten, mit Kunden sprechen, sich mit anderen Teams abstimmen, entscheiden, was als Nächstes gebaut wird. Und dann fällt mir auf: Es ist nicht das erste Mal, dass wir befürchtet haben, eine Technologie würde uns in die Massenarbeitslosigkeit führen.",
    "app": "Screenshot liegt vor: tweet-on-claude.png. Für die Folie den Screenshot nehmen — er beglaubigt stärker als gesetzter Text.",
    "n": 10
  },
  {
    "b": 2,
    "kind": "Historie",
    "headline": "Die Propheten vor ihm lagen falsch.",
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
    "say": "John von Neumann sagte 1949 ein Jahrzehnt des Ruins voraus. In den sechs Jahren danach stieg die Beschäftigung um vier Millionen. Jeremy Rifkin veröffentlichte 1995 „Das Ende der Arbeit\" — danach fiel die US-Arbeitslosigkeit unter vier Prozent. Dieselbe Sorge, immer wieder, seit der Dampfmaschine.",
    "n": 11
  },
  {
    "b": 2,
    "kind": "Daten",
    "headline": "Und trotzdem hatten sie recht.",
    "sub": "Millionen Arbeitsplätze verschwanden tatsächlich.",
    "mock": {
      "t": "chart",
      "which": "agriculture"
    },
    "say": "Und jetzt kommt der Teil, den man nicht wegdiskutieren sollte: Sie hatten ja recht. Die Jobs sind wirklich verschwunden. Die US-Landwirtschaft beschäftigte 1900 einundvierzig Prozent aller Erwerbstätigen. Im Jahr 2000 waren es zwei. Millionen von Arbeitsplätzen — weg.",
    "n": 12
  },
  {
    "b": 2,
    "kind": "Daten",
    "headline": "Aber nie im Großen und Ganzen.",
    "sub": "Die Ausschläge kamen von Kriegen und Krisen. Nicht von Technologie.",
    "mock": {
      "t": "chart",
      "which": "unemployment"
    },
    "say": "Nur: Eine dauerhafte Massenarbeitslosigkeit ist nie daraus geworden. Schauen Sie sich an, wann die Quote in Deutschland wirklich ausschlug — Weltwirtschaftskrise, Nachkriegszeit, Ölkrise, Wiedervereinigung. Kriege und Wirtschaftskrisen. Keine einzige dieser Spitzen kam von einer neuen Technologie.",
    "open": "Die Zahlen sind Ankerpunkte aus verschiedenen Quellen und vor dem Vortrag gegen EINE Quelle zu prüfen (BA-Zeitreihen). Achtung: Die im ursprünglichen Manuskript genannten 3,71 % und 6,03 % stammen aus der harmonisierten Eurostat-Messung, nicht aus der nationalen Quote (~6 %). Beides in einem Diagramm zu mischen wäre angreifbar.",
    "n": 13
  },
  {
    "b": 2,
    "kind": "Konzept",
    "headline": "Der Irrtum von der festen Menge Arbeit",
    "sub": "David Frederick Schloss prägte 1891 den Begriff der „Lump of Labor Fallacy\" — die Annahme, es gäbe eine feste Menge Arbeit in einer Volkswirtschaft.",
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
    "say": "Der Ökonom David Frederick Schloss hat dafür 1891 einen Namen gefunden: den Irrtum von der festen Menge Arbeit. Die Annahme, es gäbe einen festen Vorrat an Arbeit, und wenn eine Maschine ein Stück davon übernimmt, ist es für uns weg. So funktioniert es aber nicht. Wenn Kosten sinken, steigt die Nachfrage. Und wenn die Nachfrage steigt, entsteht neue Arbeit. Ich glaube, bei KI wird es genauso laufen — das ist meine persönliche Prognose. Softwareentwicklung wird gerade billiger. Also werden wir jetzt Probleme mit Software lösen, bei denen sich die Entwicklung vorher nicht gerechnet hätte. Wir werden mehr Software bauen. Und brauchen dafür vielleicht sogar mehr Entwickler.",
    "n": 14
  },
  {
    "b": 2,
    "kind": "Interaktiv · Publikum",
    "headline": "Welche Aufgaben haben Sie heute schon an KI abgegeben?",
    "mock": {
      "t": "results",
      "of": "abgegeben",
      "as": "list"
    },
    "say": "Und jetzt Sie noch einmal. Auf Ihrem Handy steht die Frage: Welche Aufgaben haben Sie heute schon an eine KI abgegeben, die Sie früher selbst gemacht haben? Schreiben Sie kurz mit. Ihre Antworten erscheinen hier auf der Leinwand.",
    "audience": [
      {
        "kind": "text",
        "id": "abgegeben",
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
      }
    ],
    "app": "Freitext vom Handy, Antworten erscheinen live auf der Leinwand.",
    "n": 15
  },
  {
    "b": 3,
    "kind": "Überleitung",
    "headline": "Wie hat die KI das geschafft?",
    "say": "Bleibt die Frage, die uns den Rest des Abends beschäftigt: Wie hat der Agent das eigentlich geschafft? Und warum ist Ihr eigener KI-Assistent im Alltag so viel enttäuschender als das, was Sie eben gesehen haben?",
    "n": 16
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
    "n": 17
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
    "n": 18
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
    "n": 19
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
    "n": 20
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
    "n": 21
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
    "n": 22
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
    "n": 23
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
    "n": 24
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
    "n": 25
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
    "n": 26
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
    "n": 27
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
    "n": 28
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
    "n": 29
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
    "n": 30
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
    "n": 31
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
    "n": 32
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
    "n": 33
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
    "n": 34
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
    "n": 35
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
    "n": 36
  }
] as Slide[];

export const TOTAL = SLIDES.length;

export function blockOf(n: number): Block {
  return BLOCKS[n - 1];
}

/** Klick-Schritte einer Folie; ohne Angabe genau einer. */
export function stepsOf(index: number): number {
  return SLIDES[index]?.steps ?? 1;
}
