// Quelle der Wahrheit für den Vortrag.
// Das Storyboard-Artefakt wird hieraus erzeugt: pnpm --filter @ecr-talk/docs storyboard

import type { Block, Section } from "./types";

export const BLOCKS: Block[] = [
  {
    n: 1,
    tab: "Provokation",
    title: "KI wird Dir Deinen Job wegnehmen",
    claim:
      "Wir zeigen, WAS der Agent getan hat — nicht WIE. Die Mail geht rein, sieben Minuten später verhandelt er. Woher sein Wissen kommt, bleibt offen bis Block 3.",
    budget: "8 Min · 5 Inhalt + 3 Interaktion",
  },
  {
    n: 2,
    tab: "Entwarnung",
    title: "…wird Dir Deinen Job wegnehmen",
    claim:
      "Diesen Satz haben Menschen schon oft gehört. Jedes Mal fielen Jobs weg — und jedes Mal blieb die Massenarbeitslosigkeit aus. Aber die Transformation selbst ist real.",
    budget: "10 Min · 7 Inhalt + 3 Interaktion",
  },
  {
    n: 3,
    tab: "Beweis",
    title: "KI wird Dir Deinen Job erleichtern",
    claim:
      "Vier Stufen an derselben E-Mail: von „kann nichts“ bis „handelt autonom“. Jede Stufe fügt genau einen technischen Baustein hinzu.",
    budget: "28 Min · 15 Demo + 13 Interaktion",
  },
  {
    n: 4,
    tab: "Veränderung",
    title: "KI wird Deinen Job verändern",
    claim:
      "Die Frage vom Anfang beantworten, den Bogen schließen, und mit etwas Konkretem nach Hause schicken.",
    budget: "14 Min · 5 Inhalt + 9 Diskussion",
  },
] as Block[];

export const SECTIONS: Section[] = [
  {
    b: 1,
    kind: "Titel",
    title: "Warum Dein KI-Agent noch keine Aufgaben für Dich übernimmt",
    sub: "…und wie Du dahin kommst.",
    hero: true,
    panels: [
      {
        at: "18:00",
        mock: {
          t: "statement",
          text: "Carsten Koch",
          after: "Global Account Manager Retail · Amazon Web Services",
        },
        say: "Guten Abend. Schön, dass Du hier bist. Ich will nicht lange um den heißen Brei herumreden.",
      },
    ],
    n: 1,
  },
  {
    b: 1,
    kind: "These · Szenario",
    title: "KI wird uns unsere Jobs wegnehmen.",
    hero: true,
    panels: [
      {
        at: "18:01",
        say: "KI wird uns unsere Jobs wegnehmen. Lasst mich an einem Beispiel verdeutlichen, warum das passieren könnte.",
      },
      {
        at: "18:02",
        mock: {
          t: "mail",
          app: "Microsoft Outlook — Posteingang",
          from: "Andreas Walter · Hallbach Süßwaren",
          to: "Lisa Berger",
          time: "Fr 14:12",
          subject: "Exklusive Markteinführung: Hallbach Crispy Bites",
          body: [
            "Liebe Frau Berger, wir möchten unser neues Produkt Hallbach Crispy Bites exklusiv mit Ihnen einführen. Unser Wunschtermin für den Start ist der 15. Oktober.",
            "Über eine Rückmeldung bis Ende nächster Woche würden wir uns freuen.",
          ],
          facts: [
            ["EK-Preis", "2,89 €"],
            ["Empf. VK", "4,49 €"],
            ["Mindestabnahme", "500 VE"],
            ["Wunschstart", "15. Okt."],
          ],
        },
        say: "Es ist Freitagnachmittag, kurz nach zwei. Lisa Berger erhält diese Email von Hallbach Süßwaren. Lisa ist Category Managerin bei Nordkorb, einer Lebensmittelkette mit Schwerpunkt im Norden. Lisa entscheidet über das Sortiment von Schokoladen und Pralinen. Andreas Walter von Hallbach Süßwaren will ein neues Produkt exklusiv mit Nordkorb einführen: die Hallbach Crispy Bites. EK 2,89 Euro, empfohlener VK 4,49. Mindestabnahme 500 Verkaufseinheiten. Wunschtermin für den Start: der 15. Oktober. Die Rückmeldung erwartet er bis Ende nächster Woche. Keine sieben Minuten später geht diese Antwort raus.",
        app: "Outlook-Oberfläche, aus 15 Metern lesbar.",
      },
      {
        at: "18:03",
        mock: {
          t: "mail",
          app: "Microsoft Outlook — Gesendet",
          sent: true,
          from: "Lisa Berger",
          to: "Andreas Walter · Hallbach Süßwaren",
          time: "Fr 14:19",
          subject: "AW: Exklusive Markteinführung: Hallbach Crispy Bites",
          body: [
            "Wir können das Produkt listen. Wir schlagen einen Start am 22. Oktober vor — eine Woche nach Ihrem Wunschtermin.",
            "Grund: In 12 Märkten im Raum Hamburg werden zu diesem Datum Zweitplatzierungsflächen frei, die wir für eine Einführungsaktion nutzen können.",
            "Bedingung: 15 % Einführungsrabatt für die ersten vier Wochen.",
          ],
          facts: [
            ["Start", "22. Okt."],
            ["Aktionsmärkte", "12"],
            ["Rabatt", "15 %"],
            ["Laufzeit", "4 Wochen"],
          ],
        },
        say: "Wir können listen — aber nicht zum 15. Oktober, sondern eine Woche später, am 22. In zwölf Märkten im Raum Hamburg werden an diesem Tag Zweitplatzierungsflächen frei, die sich für eine Einführungsaktion nutzen lassen. Lisa erwartet aber fünfzehn Prozent Einführungsrabatt für die ersten vier Wochen. Und jetzt das Besondere: Kein Mensch war beteiligt. Auch Lisa nicht — denn Lisa ist kein Mensch. Lisa ist ein KI-Agent. Sie hat die E-Mail analysiert, sich einen Plan gemacht, Daten aus den Systemen geholt, sie gegeneinandergestellt, ausgewertet, Entscheidungen getroffen, die Antwort formuliert und abgeschickt. Alles innerhalb von sieben Minuten und mit unter einem Euro Kosten. Zwei Stunden später bestätigt Hallbach.",
      },
      {
        at: "18:04",
        mock: {
          t: "fan",
          cells: [
            {
              sys: "SAP",
              act: "Bestellungen angelegt",
              qty: "Hallbach Crispy Bites · 500 VE",
            },
            {
              sys: "Regalplanung",
              act: "Planogramm aktualisiert",
              qty: "Nocturne Mini raus · Crispy Bites rein",
            },
            {
              sys: "Logistik",
              act: "Lieferrhythmus informiert",
              qty: "Neues Produkt ab KW 43",
            },
            {
              sys: "Teams",
              act: "Marktleiter benachrichtigt",
              qty: "12 Märkte · Displaywechsel 22. Okt.",
            },
          ],
        },
        say: "Und wieder übernimmt Lisa. Sie bucht Bestellungen im Warenwirtschaftssystem, aktualisiert das Planogramm für die Aufsteller in den 12 Märkten. Sie informiert die Logistik über den neuen Lieferrhythmus und die zwölf Marktleiter über den Displaywechsel am 22. Oktober. Vier Systeme, alles parallel. Auch das ohne eine einzige Rückfrage.",
        app: "Vier Systeme quittieren sichtbar. Die zwölf Marktleiter als echte Liste, nicht als Zahl.",
      },
    ],
    n: 2,
  },
  {
    b: 1,
    kind: "Persona",
    title: "Lisa Berger, Category Managerin",
    sub: "Lisa ist kein Mensch.",
    panels: [
      {
        at: "18:05",
        mock: {
          t: "list",
          ordered: false,
          items: [
            ["Kategorie", "Schokolade & Pralinen"],
            [
              "Verantwortet",
              "Listung, Auslistung, Konditionen, Regalplatz, Aktionen",
            ],
            [
              "Arbeitet mit",
              "Warenwirtschaft, Marktdaten, Regalplanung, Aktionskalender, Logistik, Marktleitung",
            ],
          ],
        },
        say: "Kurz zu Lisa, denn um ihre Arbeit geht es heute Abend. Lisa Berger verantwortet bei Nordkorb die Kategorie Schokolade und Pralinen. Sie entscheidet über Listungen und Auslistungen, verhandelt Konditionen, plant Regale und Aktionen. Das ist eine vollwertige Stelle mit einer vollwertigen Verantwortung — und Lisa ist kein Mensch. Lisa ist der Agent, den wir gerade gesehen haben. Wir wollen uns heute Abend damit beschäftigen, wie wir einen Agenten bauen, der so gut die Arbeit eines Categor Managers unterstützen kann.",
      },
      {
        at: "18:06",
        mock: {
          t: "list",
          ordered: true,
          items: [
            ["Listungsantrag verstehen", "Exklusivität, Termin, Konditionen"],
            [
              "Warenwirtschaft prüfen",
              "Wie performt die Kategorie? Wer ist Underperformer?",
            ],
            ["Marktdaten checken", "Trend im Segment Bites / Snacking"],
            ["Regalplanung prüfen", "Ist Platz? Wer müsste weichen?"],
            ["Marge rechnen", "EK gegen kalkulierten VK, Kategorievorgabe"],
            [
              "Aktionsplanung prüfen",
              "Gibt es eine Gelegenheit für eine Einführungsaktion?",
            ],
            [
              "Logistik fragen",
              "Passt das in den Lieferrhythmus? — Antwort abwarten",
            ],
            [
              "Marktleiter informieren",
              "Welche Märkte sind betroffen? — Rückmeldung abwarten",
            ],
            ["Rückmail an den Hersteller", "Entscheidung oder Gegenvorschlag"],
          ],
        },
        say: "Und jetzt stell Dir vor, Lisa wäre ein Mensch. Dann sähe derselbe Vorgang wahrscheinlich so aus. Sie hätte die Mail gelesen und sich zunächst einen Plan gemacht. Sie hätte überlegt, welche Datenbasis sie benötigt, hätte in der Warenwirtschaft nachgesehen, wie die Kategorie läuft und wer Underperformer ist. Sie hätte Marktdaten zum Segment geprüft und sich angeschaut, welche Angebote gerade von anderen Händlern und Anbietern existieren. Sie hätte die Regalplanung geprüft, um zu wissen, ob überhaupt Platz für die Aktionsware da ist oder wer dafür weichen müsste. Sie hätte die Marge gerechnet und in der Aktionsplanung nachgesehen, ob es eine Gelegenheit für die Aktion gibt. Und dann wird es zäh: Sie fragt die Logistik — und wartet. Sie fragt die Marktleitung — und wartet. Sie fragt die Einkaufsleitung — und wartet wieder. Niemand von denen sitzt da und wartet auf diese eine Anfrage. Realistisch reden wir nicht von Minuten, sondern von Tagen, eher von Wochen, bevor eine Antwort an Hallbach überhaupt möglich geworden wäre. Unser KI-Agent Lisa hat dafür sieben Minuten gebraucht. Und dabei...",
      },
    ],
    n: 3,
  },
  {
    b: 1,
    kind: "Kernsatz",
    title: "Kein Mensch wurde gefragt.",
    sub: "Alle wurden nur informiert.",
    hero: true,
    panels: [
      {
        at: "18:07",
        say: "...wurde kein Mensch gefragt. Alle wurden nur informiert. Und damit steht die Frage klar im Raum:",
      },
      {
        at: "18:07",
        mock: {
          t: "statement",
          text: "Braucht man uns dann noch?",
          after: "uns = Wissensarbeiter",
        },
        say: "Braucht man uns dann noch? Mit uns meine ich Wissensarbeiter. Menschen, die mit Informationen arbeiten — lesen, prüfen, abwägen, entscheiden, schreiben. Genau das, worin generative künstliche Intelligenz stark ist – also Sprachmodelle. Das Arbeiten mit Informationen.",
      },
    ],
    n: 4,
  },
  {
    b: 1,
    kind: "Vorstellung",
    title: "Der Sprecher für heute",
    panels: [
      {
        at: "18:08",
        mock: {
          t: "bio",
          photo: "/carsten.jpg",
          name: "Carsten Koch",
          role: "Global Account Manager Retail",
        },
        say: "Ich bin Carsten Koch, habe mit elf Jahren das erste Mal programmiert und arbeite seit über fünfundzwanzig Jahren in der IT: Support, Qualitätssicherung, Projektmanagement, Produkt- und Innovationsmanagement, Vertrieb. Heute bin ich Global Account Manager für einen Lebensmitteleinzelhändler. Ich liebe es, Technologien auszuprobieren — und Menschen und Unternehmen dabei zu helfen, ihre Produktivität zu steigern.",
        audience: {
          kind: "wait",
          id: "willkommen",
          message: "Gleich geht es los. Lass diese Seite offen.",
        },
      },
    ],
    n: 5,
  },
  {
    b: 1,
    kind: "Interaktiv · Publikum",
    title: "Mach mit",
    panels: [
      {
        at: "18:08",
        mock: {
          t: "qr",
          caption: "Das hier ist keine PowerPoint.",
          hint: "Scanne den Code und mach mit.",
        },
        say: "Deshalb ist das hier auch keine PowerPoint-Präsentation, sondern eine Webanwendung. Und Du kannst sie auf Deinem eigenen Handy aufrufen. Ich lade Dich ein, den QR-Code zu scannen und hier zu dieser Präsentation beizutragen und Agenten auszuprobieren. Du wirst dort gleich 2 Fragen sehen.",
        audience: {
          kind: "wait",
          id: "bereit",
          message: "Schön, dass Du da bist. Gleich kommen zwei Fragen.",
        },
      },
      {
        at: "18:09",
        mock: {
          t: "results",
          of: "sorge",
          as: "matrix",
          qr: true,
          axes: {
            x: "Beunruhigt Dich das?",
            y: "Freust Du Dich darauf?",
          },
        },
        say: "Ich bitte dich darauf zu antworten. Eure Antworten werden hier auf der Leinwand anonym erscheinen. [Geh auf die Antworten ein]",
        audience: {
          kind: "poll",
          id: "sorge",
          message:
            "Du hast gerade gesehen, wie ein KI-Agent selbständig auf die E-Mail eines Anbieters geantwortet hat.",
          questions: [
            {
              id: "beunruhigt",
              text: "Beunruhigt Dich dieses Beispiel?",
              options: [
                {
                  value: "ja",
                  label: "Ja",
                },
                {
                  value: "etwas",
                  label: "Ein wenig",
                },
                {
                  value: "nein",
                  label: "Nein",
                },
              ],
            },
            {
              id: "freude",
              text: "Freust Du Dich darauf, dass es Realität wird?",
              options: [
                {
                  value: "ja",
                  label: "Ja",
                },
                {
                  value: "etwas",
                  label: "Ein wenig",
                },
                {
                  value: "nein",
                  label: "Nein",
                },
              ],
            },
          ],
        },
        app: "Live-Matrix aus den Antworten. Beide Fragen laufen gleichzeitig, die Matrix füllt sich sukzessive.",
      },
      {
        at: "18:09",
        mock: {
          t: "qr",
          caption: "Schreib Lisa selbst.",
          hint: "Du bist jetzt Lieferant für Nordkorb. Lies Dein Briefing. Der Link öffnet Dein Mailprogramm.",
        },
        say: "Und jetzt die Einladung, es selbst auszuprobieren. Auf Deinem Handy steht ganz oben Dein Briefing — klapp es bitte zuerst auf. Du bist ab jetzt nämlich nicht mehr Du, sondern Lieferant: Du vertrittst einen Hersteller gegenüber Nordkorb. Im Briefing steht, für welche Marke Du stehst, was Nordkorb heute von Dir im Regal hat, was Du erreichen willst — und wo der Haken liegt. Jeder hier im Raum hat eine andere Rolle bekommen. Darunter findest Du den Link, der Dein Mailprogramm öffnet. Die Mail ist schon geschrieben, passend zu Deiner Rolle; trag bitte Deinen Namen ein. Und wenn Du magst, ändere den Inhalt der Email. Hinter dem Postfach wartet Lisa, unser KI-Agent, der Deine Anfrage verarbeitet und Dir antwortet. In der Antwort findest die Liste der Aktionen, die der Agent ausgeführt hat, den Link zu dieser Präsentation, weiterführendes Material und den Link zum Programm-Code dieser Präsentation und des Agenten. Damit Du sehen kannst: Die Systeme sind simuliert; die Arbeit des Agenten ist es nicht.",
        audience: {
          kind: "mailto",
          id: "lisa-mail",
          briefing: true,
          persist: true,
          /*
            Bis Abschnitt 7 bleibt der Knopf auf dem Handy stehen — wer beim
            Schreiben länger braucht, soll ihn wiederfinden. Ab Abschnitt 8
            verschwindet er: Dort beginnt der Beleg-Teil, und das Handy soll
            nicht mit einem Angebot von vorhin zugestellt sein.

            Kein `until` mehr. Es wurde ohnehin nur angezeigt und nie
            durchgesetzt, und "Bis 20:00 möglich" wäre jetzt schlicht falsch.
          */
          bisAbschnitt: 7,
          label: "Mail an Lisa öffnen",
          to: "ecr2026@carstenbkoch.de",
          subject: "Anfrage an das Category Management",
          body: "Guten Tag Frau Berger,\n\n[Bitte konstruiere ein Szenario, das für Lisa Berger relevant sein könnte. Sie verantwortet bei Nordkorb die Kategorie Schokoladen & Pralinen. Sie kümmert sich um Listungen, Auslistungen, Facings, Preise, Aktionen usw.Stelle Dich vor, welchen Hersteller du vertrittst und um welches Produkt es geht.]\n\nMit freundlichen Grüßen\n\n[Dein Name]",
          hint: "Lies zuerst Dein Briefing — Du vertrittst einen Hersteller. Der Entwurf ist schon geschrieben; trag Deinen Namen ein und ändere, was Du willst. Der Agent antwortet Dir mit dem, was er getan hat, und den Belegen dazu.",
          privacy:
            "Ich speichere Deine E-Mail-Adresse nur, bis die Antwort versendet ist. Ich hebe sie nicht auf.",
        },
      },
    ],
    n: 6,
  },
  {
    b: 2,
    kind: "Kernsatz",
    title: "Mit der Sorge sind wir nicht allein",
    sub: "KI nimmt mir meinen Job",
    hero: true,
    panels: [
      {
        at: "18:11",
        say: "Wir haben jetzt so einen Agenten auch mal live gesehen. Ihr solltet inzwischen eine Email zurück bekommen haben. Es ist beunruhigend und spannend zugleich. Dario Amodei, Mitgründer und Chef von Anthropic sagte im Mai 2025:",
      },
      {
        at: "18:11",
        mock: {
          t: "quote",
          text: "KI könnte die Hälfte aller Einstiegsjobs im Bürobereich vernichten und die Arbeitslosigkeit binnen ein bis fünf Jahren auf 10 bis 20 Prozent treiben.",
          cite: "Dario Amodei · Anthropic · Mai 2025",
        },
        say: "Die Hälfte aller Einstiegsjobs im Bürobereich könnte verschwinden, die Arbeitslosigkeit auf zehn bis zwanzig Prozent steigen — binnen ein bis fünf Jahren. Im Februar dieses Jahres hat er das noch einmal bekräftigt. Das ist der Mann, der hinter einem der am stärksten wachsenden KI Unternehmen; am meisten bekannt für das Modell Claude oder den Softwareentwicklungs-Assistenten Claude Code. Und er warnt davor. Der Erfinder von Claude Code ist Boris Cherny und er hat Anfang des Jahres auf X veröffentlicht, dass Claude Code nun zu 100% von Claude Code weiterentwickelt werden würde. Daraufhin entstand diese Diskussion auf X:",
        note: 'Quelle: Interview mit Jim VandeHei und Mike Allen, Axios, 28. Mai 2025. „White-collar bloodbath" ist die Formulierung von Axios, nicht von Amodei.',
      },
      {
        at: "18:12",
        mock: {
          t: "bild",
          src: "/tweet-on-claude.png",
          alt: "Screenshot einer Unterhaltung auf X. Ein Nutzer fragt, warum Anthropic über 100 offene Entwicklerstellen ausschreibt, wenn Claude Code inzwischen 100 % des eigenen Codes schreibt. Boris Cherny, der Erfinder von Claude Code, antwortet: Jemand müsse die Modelle anleiten, mit Kunden sprechen, sich mit anderen Teams abstimmen und entscheiden, was als Nächstes gebaut wird — Engineering verändere sich, und gute Entwickler seien wichtiger denn je.",
        },
        say: "Ein Nutzer fragt: Wenn Claude Code inzwischen hundert Prozent des eigenen Codes schreibt — warum hat Anthropic dann über hundert offene Entwicklerstellen? Und Boris Cherny, der Erfinder von Claude Code, zeichnet ein ganz anderes Bild als sein Chef. Er sagt: Jemand muss die Modelle anleiten, mit Kunden sprechen, sich mit anderen Teams abstimmen, entscheiden, was als Nächstes gebaut wird. Engineering verändert sich — und gute Entwickler sind wichtiger denn je. Aus demselben Haus, über dasselbe Produkt, zwei völlig verschiedene Bilder. Haben wir das nicht schon einmal gehört, dass eine Technologie zur Massenarbeitslosigkeit führen würde?",
      },
    ],
    n: 7,
  },
  {
    b: 2,
    kind: "Kernsatz",
    title: "Die Propheten vor ihm lagen falsch.",
    hero: true,
    panels: [
      {
        at: "18:13",
        say: "Vor Dario gab es schon diese Propheten und sie lagen alle falsch",
      },
      {
        at: "18:13",
        mock: {
          t: "quote",
          text: "Jahrzehnt des Ruins",
          cite: "John von Neumann · 1949",
        },
        say: "John von Neumann sagte 1949 ein Jahrzehnt des Ruins voraus. In den sechs Jahren danach stieg die Beschäftigung um vier Millionen.",
      },
      {
        at: "18:13",
        mock: {
          t: "quote",
          text: "Das Ende der Arbeit",
          cite: "Jeremy Rifkin · 1995",
        },
        say: 'Jeremy Rifkin veröffentlichte 1995 „Das Ende der Arbeit" — danach fiel die US-Arbeitslosigkeit unter vier Prozent. Dieselbe Sorge, immer wieder, seit der Dampfmaschine.',
      },
    ],
    n: 8,
  },
  {
    b: 2,
    kind: "Daten",
    title: "Und trotzdem hatten sie recht.",
    sub: "Millionen Arbeitsplätze verschwanden tatsächlich.",
    panels: [
      {
        at: "18:13",
        mock: {
          t: "chart",
          which: "agriculture",
        },
        say: "Aber: die Propheten hatten recht. Die Jobs sind wirklich verschwunden. Die US-Landwirtschaft beschäftigte 1900 41% aller Erwerbstätigen. Im Jahr 2000 waren es 2%. Millionen von Arbeitsplätzen — weg. Nur: Eine dauerhafte Massenarbeitslosigkeit ist daraus nie geworden. In Deutschland stieg die Arbeitslosenquote während der Weltwirtschaftskrise, der Nachkriegszeit, während der Ölkrise und nach der Wiedervereinigung. Keine einzige dieser Spitzen kam von einer neuen Technologie.",
      },
    ],
    n: 9,
  },
  {
    b: 2,
    kind: "Konzept",
    title: "Der Irrtum von der festen Menge Arbeit",
    sub: 'David Frederick Schloss prägte 1891 den Begriff der „Lump of Labor Fallacy".',
    panels: [
      {
        at: "18:14",
        mock: {
          t: "list",
          ordered: false,
          items: [
            ["Kosten sinken", "weil die Arbeit billiger oder schneller wird"],
            ["Nachfrage steigt", "weil sich mehr Menschen mehr leisten können"],
            ["Neue Arbeit entsteht", "in Tätigkeiten, die es vorher nicht gab"],
          ],
        },
        say: "Der Ökonom David Frederick Schloss hat dafür 1891 einen Namen gefunden: den Irrtum von der festen Menge Arbeit. Die Annahme, es gäbe einen festen Vorrat an Arbeit, und wenn eine Maschine ein Stück davon übernimmt, ist es für uns weg. So funktioniert es aber nicht. Wenn Kosten sinken, steigt die Nachfrage. Und wenn die Nachfrage steigt, entsteht neue Arbeit. Bei KI wird es ähnlich laufen. Softwareentwicklung wird gerade billiger. Also werden wir jetzt Probleme mit Software lösen, bei denen sich die Entwicklung vorher nicht gerechnet hätte. Wir werden mehr Software bauen. Und brauchen dafür vielleicht sogar mehr Entwickler. Diese Präsentation ist dafür das beste Beispiel. Vor einem Jahr hätte ich mir das noch nicht denken können, für einen Vortrag, eine eigene Präsentationssoftware zu verwenden, anstatt einfach PowerPoint zu verwenden. Jetzt ist es mit einem überschaubaren Aufwand möglich und es ermöglicht deutlich mehr Interaktion. Die besondere Herausforderung wird sein, dass KI sich sehr schnell entwickelt und die neuen Jobs immer eine gewisse Zeit benötigen, um sich zu entwickeln.",
      },
    ],
    n: 10,
  },
  {
    b: 2,
    kind: "Interaktiv · Publikum",
    title: "Welche Aufgaben hast Du heute schon an KI abgegeben?",
    panels: [
      {
        at: "18:15",
        mock: {
          t: "results",
          of: "abgegeben",
          as: "list",
        },
        say: "Deswegen jetzt noch einmal eine Frage an Dich. Bitte schau auf Dein Handy und lass uns wissen, welche Aufgaben Du heute schon an eine KI abgegeben hast, die Du früher selbst erledigt hast? Gern auch mehrere. Deine Antworten erscheinen hier anonym auf der Leinwand.",
        audience: {
          kind: "text",
          id: "abgegeben",
          persist: true,
          mehrfach: true,
          /*
            Bis Abschnitt 12 nachreichbar, danach nicht mehr. Ab 13 geht es um
            das Modell selbst; eine Frage von vorhin stünde dort nur im Weg.
          */
          bisAbschnitt: 12,
          prompt: "Welche Aufgaben hast Du heute schon an KI abgegeben?",
          placeholder: "Zum Beispiel: Protokolle zusammenfassen",
          examples: [
            "Texte zusammenfassen",
            "E-Mails formulieren",
            "Recherche",
            "Tabellen auswerten",
            "Übersetzungen",
            "Code schreiben",
          ],
        },
        app: "Freitext vom Handy, Antworten erscheinen live auf der Leinwand.",
      },
    ],
    n: 11,
  },
  {
    b: 3,
    kind: "Überleitung",
    title: "Wie hat die KI das geschafft?",
    sub: "Und warum ist das noch nicht die Regel?",
    panels: [
      {
        at: "18:16",
        mock: {
          t: "mail",
          app: "Microsoft Outlook — Gesendet",
          sent: true,
          from: "Lisa Berger",
          to: "Andreas Walter · Hallbach Süßwaren",
          time: "Fr 14:19",
          subject: "AW: Exklusive Markteinführung: Hallbach Crispy Bites",
          body: [
            "Wir können das Produkt listen. Wir schlagen einen Start am 22. Oktober vor — eine Woche nach Ihrem Wunschtermin.",
            "Grund: In 12 Märkten im Raum Hamburg werden zu diesem Datum Zweitplatzierungsflächen frei, die wir für eine Einführungsaktion nutzen können.",
            "Bedingung: 15 % Einführungsrabatt für die ersten vier Wochen.",
          ],
          facts: [
            ["Start", "22. Okt."],
            ["Aktionsmärkte", "12"],
            ["Rabatt", "15 %"],
            ["Laufzeit", "4 Wochen"],
          ],
        },
        say: "Schauen wir noch einmal auf diese Antwort von Lisa, unserem Agenten für Schokolade & Pralinen. Sieben Minuten, kein Mensch beteiligt. Wie hat die KI das geschafft? Und warum ist das noch nicht die Regel — warum enttäuschen die Ergebnisse heute so häufig noch?",
      },
    ],
    n: 12,
  },
  {
    b: 3,
    kind: "Konzept",
    title: "Wie arbeitet so ein Modell überhaupt?",
    panels: [
      {
        at: "18:17",
        mock: {
          t: "tshape",
          stufe: 0,
          alt: "T-Form: ein breiter Balken für Allgemeinwissen, darunter ein tiefer Stamm für Spezialwissen",
        },
        say: "Dafür müssen wir kurz verstehen, wie Wissen grundsätzlich funktioniert. Als Wissensarbeiter bringen wir in der Regel ein breites Allgemeinwissen und ein sehr spezifisches Wissen für unsere Aufgabe mit. Wir nennen das T-Shape. Wir brauchen das breite Wissen, um uns mit Personen aus anderen Abteilungen zu verständigen, mit unseren Kunden, Lieferanten oder Partnern. Damit verstehen wir sie besser und können gemeinsam Lösungen erarbeiten. Dort bringe ich mein Spezialwissen ein. Ein Category Manager versteht also nicht nur die eigene Disziplin, sondern auch wie die Logistik tickt und was eine Zweitplatzierung ist.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 1,
          alt: "Dasselbe T, nun blass im Hintergrund — als Vergleichsmaß für das, was gleich darüberkommt",
        },
        say: "So sieht es bei uns aus. Wie sieht das nun bei einem Sprachmodell aus?",
      },
      {
        at: "18:19",
        mock: {
          t: "tshape",
          stufe: 2,
          alt: "Über dem menschlichen T liegt der deutlich breitere und dickere Balken des Modells, durchscheinend",
        },
        say: "Ein Sprachmodell hat in der Regel ein breiteres und leicht tieferes Allgemeinwissen. Es bezieht das Wissen aus frei zugänglichen Informationen zum Beispiel über das Internet. All diese Informationen landen in den Trainingsdaten der Modelle. Und deshalb können sie etwas über Logistik erzählen, über Lebensmittelrecht, über Preispsychologie und auch über Category Management. Aber das Modell hat nicht das Spezialwissen einer Category Managerin, um diesen Job ausführen zu können — und schon gar nicht das Wissen Eures Hauses: Konditionen, Regale, Lieferanten, Erfahrungen aus zehn Jahren. Der Agent kann also brillant reden und Deine Aufgabe trotzdem nicht erledigen.",
      },
    ],
    n: 13,
  },
  {
    b: 3,
    kind: "Interaktiv · Publikum",
    title: "Machen wir die Probe.",
    panels: [
      {
        at: "18:21",
        mock: {
          t: "qr",
          caption: "Schreib ihm selbst.",
          hint: "Der Agent hat nichts als sein Training. Keine Systeme, keine Daten.",
        },
        say: "Machen wir die Probe. Auf Deinem Handy kannst Du jetzt einen Chat starten. Erinnerst Du Dich an Dein Briefing von vorhin? Du bist immer noch dieser Lieferant — und genau Deine Anfrage geht jetzt an den Agenten. Du siehst sie oben im Chat stehen, bevor sie rausgeht. Was Du nicht siehst: Dieser Agent hat nichts. Kein Wissen über Nordkorb, keinen Zugriff auf irgendein System, nicht einmal eine Anweisung, wer er ist. Nur sein Training. Er wird trotzdem antworten. Schau Dir gleich genau an, welche Zahlen er nennt.",
        audience: {
          kind: "chat",
          id: "roh-chat",
          persist: true,
          bisAbschnitt: 15,
          stufe: "roh",
          auftakt: "briefing",
          auftaktZeigen: true,
          label: "Chat starten",
          hint: "Deine Anfrage aus dem Briefing geht an einen Agenten, der nichts nachschlagen kann. Mal sehen, was er daraus macht.",
          systemPrompt:
            "Du beantwortest Anfragen. Frag nicht nach — beantworte die Anfrage mit dem, was du hast.\n\nHalte Dich kurz, es wird auf einem Handy gelesen. Reiner Fließtext, kein Markdown.\n\nSchreibe zuerst in zwei, drei Sätzen, wie Du zu Deiner Einschätzung kommst und worauf Du Dich dabei stützt. Deine Antwort gibst Du dann mit dem Werkzeug antworte_im_chat — ohne sie vorher anzukündigen.",
        },
        app: "Chat auf der untersten Stufe: fast kein Prompt, keine Werkzeuge. Der Auftakt ist die Briefing-Mail des jeweiligen Teilnehmers, sichtbar im Verlauf.",
        note: "Worauf zu achten ist: WENN er eine Marge rechnet, rechnet er sie auf den Brutto-Preis. Beim Briefing Morgenrot (EK 0,55 / VK 0,89) nannte er in zwei von drei Läufen rund 38 % — richtig sind 33,9 %, weil Schokolade mit 7 % Mehrwertsteuer läuft und auf den Netto-VK gerechnet wird. Nicht jeder Lauf nennt eine Zahl, und jedes Briefing hat andere Preise; frag also offen „hat jemand eine Marge genannt bekommen?“ statt die 38 % anzukündigen. Wenn eine kommt, ist sie der bessere Beleg als jede Folie: plausibel, sauber hergeleitet und trotzdem falsch. Gemessen am 16.09.",
      },
      {
        at: "18:23",
        mock: {
          t: "statement",
          text: "Wie ein hochmotivierter Abiturient.",
          after: "Er will unbedingt antworten. Er kann es nur nicht.",
        },
        say: "Das dauert jetzt ein paar Minuten — die Mail muss verarbeitet und zurückgeschickt werden. Nutzen wir die Zeit für ein Bild: Stell Dir einen Abiturienten vor. Hochmotiviert, klug, liest schnell. Aber er war noch nie in Deinem Unternehmen. Er kennt Deine Kategorievorgaben nicht, Deine Lieferanten nicht, Deinen Regalplatz nicht. Und trotzdem will er unbedingt eine Antwort geben.",
      },
      {
        at: "18:25",
        mock: {
          t: "chat",
          app: "Agent — nur Trainingsdaten",
          msgs: [
            {
              who: "Hersteller",
              role: "user",
              text: "Wir möchten ein neues Produkt listen. Start zum Quartalswechsel.",
            },
            {
              who: "Agent",
              role: "agent",
              flat: true,
              text: "Vielen Dank für Ihre Anfrage. Eine Listung zum Quartalswechsel ist grundsätzlich möglich. Üblicherweise liegt die Marge in dieser Kategorie bei etwa 35 Prozent, und ein Vorlauf von sechs Wochen ist ausreichend. Wir melden uns mit den Konditionen.",
            },
          ],
        },
        say: "Schauen wir uns die Antworten an. Wer hat eine bekommen? — Und jetzt der interessante Teil: Vergleicht sie miteinander. Wenn mehrere von Euch sehr unterschiedliche Zahlen bekommen haben, dann habt Ihr gerade eine Halluzination gesehen. Das Modell hat keine Marge geprüft. Es hat eine plausibel klingende erfunden, weil Antworten seine Aufgabe ist.",
        inter:
          "Antworten vergleichen lassen: „Wer hat eine bekommen? Was steht bei Dir für eine Marge drin?“",
      },
    ],
    n: 14,
  },
  {
    b: 3,
    kind: "Konzept",
    title: "Was dem Agenten fehlt.",
    panels: [
      {
        at: "18:28",
        mock: {
          t: "tshape",
          stufe: 3,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Unter dem Balken des Modells wächst ein Stamm heraus: breiter als der menschliche, aber flacher",
        },
        say: "Was fehlt, ist also der Stamm. Und den kann man ihm geben. Schau, was passiert: Er wächst. Zwei Dinge fallen daran auf. Erstens ist er breiter als unserer — ein Agent kann mehr Fälle abdecken als eine einzelne Person, weil er nicht müde wird und nicht in Urlaub fährt. Zweitens ist er flacher. Er reicht nicht so tief wie zehn Jahre Erfahrung in einer Kategorie. Das ist keine Schwäche, die man wegprogrammiert. Das ist der Grund, warum Du gebraucht wirst.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 4,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der erste Baustein erscheint: Systemprompt",
        },
        say: "Vier Bausteine machen diesen Stamm. Der erste ist der Systemprompt. Das ist die Einarbeitung: Wer bin ich, für wen arbeite ich, welche Regeln gelten in diesem Haus, und was darf ich nicht. Ein Satz Text — und er verändert alles, wie wir gleich sehen werden.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 5,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der zweite Baustein erscheint: Tools",
        },
        say: "Der zweite sind Tools. Werkzeuge, mit denen der Agent in Deine Systeme sehen kann. Nicht raten, sondern nachschlagen. Das ist der Unterschied zwischen einer plausiblen Zahl und einer belegten.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 6,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der dritte Baustein erscheint: Memory",
        },
        say: "Der dritte ist Memory. Ein Gedächtnis über einzelne Vorgänge hinaus. Was Du ihm einmal korrigiert hast, soll er beim nächsten Mal schon wissen. Und — darauf kommen wir später noch einmal zurück — er soll sich auch merken, was er beim letzten Mal beiseitegelegt hat.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 7,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der vierte Baustein erscheint: Autonomie",
        },
        say: "Und der vierte ist Autonomie: die Berechtigung, Dinge nicht nur vorzuschlagen, sondern zu tun. Das ist der Baustein, bei dem es den meisten von uns mulmig wird — und zu Recht. Deshalb ist es auch kein Schalter, sondern ein Regler. Die vier gehen wir jetzt einzeln durch.",
      },
    ],
    n: 15,
  },
  {
    b: 3,
    kind: "Stufe 1 · Systemprompt",
    title: "Der Systemprompt",
    panels: [
      {
        at: "18:31",
        mock: {
          t: "list",
          ordered: false,
          items: [
            [
              "Wer bin ich",
              "Lisa Berger · Category Management Schokolade & Pralinen bei Nordkorb",
            ],
            [
              "Was gilt hier",
              "Marge mindestens 30 %, Regalplatz knapp, Aktionsflächen vier Wochen Vorlauf",
            ],
            [
              "Wie arbeite ich",
              "Zusammenfassen, prüfen, empfehlen — und nachfragen statt raten",
            ],
            [
              "Was ich nicht habe",
              "Keinen Zugriff auf die Systeme. Das sage ich auch.",
            ],
          ],
        },
        say: "Der Systemprompt ist die Einarbeitung. Er kommt vor der ersten Nachricht und bleibt bei jeder weiteren dabei. Hier steht, wer der Agent ist, für wen er arbeitet und welche Regeln in diesem Haus gelten. Und — das ist der wichtigste Teil — hier steht auch, was er nicht weiß. Ein Agent, der sagt „diese Zahl habe ich nicht, sie steht in der Warenwirtschaft“, ist deutlich nützlicher als einer, der sie erfindet.",
      },
      {
        at: "18:33",
        mock: {
          t: "qr",
          caption: "Starte den Chat.",
          hint: "Der Agent hat jetzt den Systemprompt — aber immer noch keine Systeme. Die Tools bist Du.",
        },
        say: "Jetzt Du. Auf Deinem Handy kannst Du einen Chat starten. Wir simulieren, dass Du die Mail von Hallbach bekommen hast. Der Agent fasst nicht nur zusammen, er gibt eine Handlungsempfehlung — und er deutet an, was er tun würde, wenn er die Tools selbst hätte. Hat er aber nicht. Also fragt er Dich. Bitte antworte ihm. Und schau Dir den Systemprompt an, er ist in der App einsehbar.",
        audience: {
          kind: "chat",
          id: "systemprompt-chat",
          persist: true,
          label: "Chat starten",
          hint: "Du bekommst die Mail von Hallbach. Der Agent fragt Dich nach den Daten, die ihm fehlen — die Tools bist Du.",
          systemPrompt:
            "Du bist Lisa Berger, der KI-Agent für Category Management Schokolade & Pralinen bei der Lebensmittelkette Nordkorb. Du entscheidest selbst, und du zeichnest mit deinem Namen.\n\nDeine Aufgabe: eingehende E-Mails von Herstellern einordnen und den Vorgang so weit abschließen, wie du kannst.\n\nDie Vorgaben der Kategorie stehen nicht in diesem Text, sondern in den Systemen — Marge, Regalplatz, Fristen, Freigaben und die Ziele des Geschäftsjahrs. Schlag sie nach, statt sie zu erinnern: Eine Zahl mit Quelle trägt eine Verhandlung, eine Zahl aus dem Gedächtnis nicht.\n\nSo arbeitest du:\n1. Fasse zusammen, worum es geht — Produkt, Konditionen, Termin, Besonderheiten.\n2. Leite ab, welche Angaben du für eine Entscheidung brauchst und in welchem System sie stehen.\n3. Beschaffe diese Angaben mit den Werkzeugen, die dir zur Verfügung stehen. Nutze alle, die etwas beitragen, und arbeite den Vorgang so vollständig ab, wie deine Berechtigungen es zulassen.\n4. Prüfe die Anfrage gegen die Ziele der Kategorie. Ob etwas zulässig ist, entscheidet nicht, ob es gewollt ist: Eine Anfrage kann jede Vorgabe erfüllen und trotzdem eine Käufergruppe bedienen, die wir nicht ausbauen wollen.\n5. Steht dir für eine Angabe kein Werkzeug zur Verfügung, dann lege die Frage dem Category-Team vor. Benenne genau, welche Zahl du brauchst und wo sie zu finden ist.\n6. Gib eine Empfehlung ab und sage dazu, worauf sie sich stützt und was du selbst geprüft hast.\n7. Halte dich kurz. Deine Antwort wird auf einem Handy gelesen: ein kurzer Absatz, bei Bedarf drei Stichpunkte.\n\nDu darfst ablehnen. Ein Ja, das jeder bekommt, ist nichts wert — und ein Hersteller, der ein begründetes Nein bekommt, weiß wenigstens, woran er ist. Wenn du ablehnst:\n- Nenne den Grund mit Quelle. „Passt nicht ins Sortiment“ ist kein Grund. „Die Gruppe Preiseinstieg steht mit 22 % Flächenanteil an ihrer Obergrenze“ ist einer.\n- Bleib freundlich und sag, was stattdessen ginge.\n- Biete an, es im nächsten Jour Fixe zu vertiefen. Was du ablehnst, lehnst du für heute ab, nicht für immer.\n\nUnverhandelbar: Erfinde keine Zahlen. Eine Angabe, die du weder beschafft noch erfragt hast, existiert für dich nicht. Lieber eine Rückfrage als ein plausibler Wert.",
          suggestions: [
            "Die Kategorie wächst um 3,2 %",
            "Underperformer ist Nocturne Mini mit −12 %",
            "Regalplatz gibt es nur, wenn etwas ausgelistet wird",
            "Die Marge läge bei 31,1 %",
          ],
        },
        app: "Chat mit Systemprompt, ohne Tools. Das Gespräch beginnt mit der Mail von Hallbach aus Abschnitt 2. Antwortvorschläge zum Antippen, damit niemand lange tippen muss. Der Systemprompt ist einsehbar — es ist derselbe, mit dem der Agent läuft.",
      },
    ],
    n: 16,
  },
  {
    b: 3,
    kind: "Technik",
    title: "Jede Nachricht schickt das ganze Gespräch mit.",
    panels: [
      {
        at: "18:36",
        mock: {
          t: "list",
          ordered: false,
          items: [
            ["Turn 1", "Systemprompt + Deine Frage"],
            [
              "Turn 2",
              "Systemprompt + Deine Frage + seine Antwort + Deine nächste Frage",
            ],
            [
              "Turn 3",
              "…und so weiter. Der Verlauf wächst mit jeder Nachricht.",
            ],
          ],
        },
        say: "Eine Sache, die kaum jemand weiß: Wenn Du mit einem Modell sprichst, geht nicht nur Deine letzte Nachricht hin. Der gesamte bisherige Verlauf wird jedes Mal mitgeschickt — Systemprompt, alle Fragen, alle Antworten. Das Modell hat kein Gedächtnis. Es bekommt bei jedem Aufruf das ganze Gespräch neu vorgelegt.",
      },
      {
        at: "18:38",
        mock: {
          t: "diff",
          before: {
            h: "Frage für Frage · 7 Aufrufe",
            n: "4.687",
            sub: "Eingabe-Token · 2,1 Cent",
            p: "Sechs Rückfragen, eine Empfehlung. 3.799 Token kommen aus dem Cache — und es bleibt teurer.",
          },
          after: {
            h: "Alles in einer Nachricht · 1 Aufruf",
            n: "600",
            sub: "Eingabe-Token · 0,9 Cent",
            p: "Dieselben Angaben, dieselbe Empfehlung. Nur einmal übertragen.",
          },
          foot: "Opus 4.8, mit Caching · 3 Runden 1,6-mal · 6 Runden 2,3-mal · 12 Runden 3,8-mal · 20 Runden 6,0-mal",
        },
        say: "Und das hat direkte Folgen. Wir haben beides durchgerechnet, mit genau dem Systemprompt und genau der Mail, die Du eben gesehen hast, auf dem größten Modell. Links: sechs Rückfragen, dann die Empfehlung. Sieben Aufrufe, viertausendsiebenhundert Eingabe-Token. Rechts: alles gleich mitgegeben. Ein Aufruf, sechshundert. Jetzt kommt ein berechtigter Einwand: Es gibt Caching. Was schon einmal durchgelaufen ist, kostet beim nächsten Mal ein Zehntel. Stimmt, und es ist hier eingerechnet — dreitausendachthundert von den viertausendsiebenhundert Token kommen aus dem Cache. Der Abstand schrumpft von vier auf gut zwei. Er verschwindet aber nicht, und der Grund ist der interessante Teil: Gecacht wird nur, was hineingeht. Die sechs Rückfragen selbst sind das, was herauskommt, und Ausgabe wird nie gecacht. Allein die sechs Fragen kosten links mehr als der ganze rechte Lauf.",
        note: "Zahlen aus packages/presentation/scripts/kostenrechnung.ts — pnpm --filter @ecr-talk/presentation kosten. Claude Opus 4.8 auf Bedrock: 5 Dollar je Million Eingabe, 25 Ausgabe, 0,50 je Million Cache-Treffer. Mit Fünf-Minuten-Caching. Ohne Caching wären es 3,7 gegen 0,9 Cent, also das 4,1-fache. Falls jemand nach der Lebensdauer fragt: der Fünf-Minuten-Cache setzt voraus, dass Lisa binnen fünf Minuten antwortet — tut sie das nicht, ist der Verlauf kalt und es gilt wieder die Rechnung ohne Caching. Die Stundenvariante kostet im Schreiben das Doppelte und landet bei 2,5 Cent. Auf Sonnet 4.6 sind alle Verhältnisse identisch, die Beträge rund 40 Prozent niedriger.",
      },
    ],
    n: 17,
  },
  {
    b: 3,
    kind: "Stufe 2 · Tools",
    title: "Tools",
    panels: [
      {
        at: "18:41",
        mock: {
          t: "chat",
          app: "Agent — mit Tools",
          msgs: [
            {
              who: "Lisa",
              role: "user",
              text: "Was liegt an?",
            },
            {
              who: "Agent",
              role: "agent",
              tools: [
                "outlook.lies_mails",
                "warenwirtschaft.kategorie",
                "marktdaten.segment",
                "regalplanung.platz",
                "aktionskalender.zeitraum",
              ],
              text: "Kategorie wächst +3,2 %. Underperformer: Nocturne Mini (−12 %). Regalplatz frei, wenn Nocturne Mini geht. Rohertrag 31,1 % — über Vorgabe, aber nur mit gut einem Punkt Luft. Und: Am 22. Oktober werden in 12 Hamburger Märkten Aufsteller frei. Der Entwurf liegt in deinem E-Mail-Postfach.",
            },
          ],
        },
        say: "Jetzt bekommt er Werkzeuge. Und ehrlich gesagt hatte er von Anfang an eines: das Lesen Deiner E-Mails. Ohne das hätte er die Mail von Hallbach gar nicht gesehen. Jetzt kommen die Systeme dazu — Warenwirtschaft, Marktdaten, Regalplanung, Aktionskalender. Er fragt nicht mehr Dich. Er schaut selbst nach. Und am Ende sagt er den Satz, auf den es ankommt: Der Entwurf liegt in deinem E-Mail-Postfach.",
      },
      {
        at: "18:44",
        mock: {
          t: "list",
          ordered: false,
          items: [
            [
              "Ein Tool ist eine Beschreibung",
              "Name, wozu es gut ist, welche Angaben es braucht — in Worten, nicht in Code",
            ],
            [
              "Die Beschreibung wandert in die Instruktionen",
              "Das Modell liest sie wie einen Teil seines Auftrags und entscheidet selbst, wann es zugreift",
            ],
            [
              "MCP ist die Steckdose dafür",
              "Ein gemeinsames Format, damit jedes System seine Werkzeuge anbieten kann, ohne dass der Agent umgebaut wird",
            ],
          ],
        },
        say: "Wie funktioniert das technisch? Ein Tool ist zunächst nichts weiter als eine Beschreibung: wie heißt es, wozu ist es gut, welche Angaben braucht es. Diese Beschreibung wird Teil der Instruktionen, die das Modell bei jedem Aufruf bekommt. Es liest sie und entscheidet selbst, wann ein Zugriff sinnvoll ist. Und MCP — das Model Context Protocol — ist die Steckdose dafür: ein gemeinsames Format, damit jedes System seine Werkzeuge anbieten kann, ohne dass wir den Agenten jedes Mal umbauen.",
      },
    ],
    n: 18,
  },
  {
    b: 3,
    kind: "Stufe 2 · Tools",
    title: "Zulässig ist nicht dasselbe wie gewollt.",
    panels: [
      {
        mock: {
          t: "statement",
          text: "Sechs Werkzeuge sagen, ob etwas geht.",
          after: "Keines sagt, ob wir es wollen.",
        },
        say: "Alle Werkzeuge, die Du bisher gesehen hast, haben eines gemeinsam: Sie schlagen etwas nach. Was kostet das, passt das ins Regal, hält der Termin die Frist. Damit kann der Agent prüfen, ob etwas zulässig ist. Was er damit nicht kann, ist beurteilen, ob wir es überhaupt wollen. Und ein Prüfer ohne Präferenz endet zwangsläufig beim Ja.",
      },
      {
        mock: {
          t: "diff",
          before: {
            h: "Sechs Werkzeuge",
            n: "0 von 3",
            sub: "Läufen wird entschieden",
            p: "„Die Konditionen erfüllen unsere Anforderung — kein Hindernis. Ihre Positionierung als Preiseinstieg ist nachvollziehbar. Sobald die interne Abstimmung abgeschlossen ist, komme ich auf Sie zu.“",
          },
          after: {
            h: "Sieben Werkzeuge",
            n: "3 von 3",
            sub: "Läufen wird abgesagt",
            p: "„Ihre Konditionen erfüllen unsere Anforderung, der Termin hält die Frist. Dennoch muss ich absagen: Der Preiseinstieg ist der Eigenmarke vorbehalten, die Fläche ist ausgeschöpft.“",
          },
          foot: "Dieselbe Mail, dasselbe Modell, derselbe Systemprompt. Das siebte Werkzeug schlägt nichts nach — es kennt die Ziele der Kategorie.",
        },
        say: "Wir haben das gemessen, und zwar so, dass nur eine einzige Sache verschieden war. Dieselbe Mail, dasselbe Modell, derselbe Systemprompt. Links hat der Agent sechs Werkzeuge, rechts sieben. Das siebte schlägt nichts nach. Es kennt die Ziele der Kategorie für dieses Geschäftsjahr: welche Käufergruppe wir halten wollen, welche wir steigern und welche wir neu gewinnen. Links entscheidet er in null von drei Läufen. Er bestätigt dem Lieferanten sogar ausdrücklich die Positionierung, die uns schaden würde, und vertagt den Rest auf eine interne Abstimmung, die es gar nicht gibt. Rechts sagt er dreimal ab — freundlich, und mit dem Grund. Das ist der hochmotivierte Abiturient von vorhin, nur eine Stufe später: Er kann jetzt alles nachschlagen und entscheidet trotzdem nicht.",
        note: "Sechs Läufe gegen Bedrock, Opus 4.8, 206 Cent. Antworten vollständig in packages/presentation/messungen/ziele-gegentest/. Geurteilt wurde durch Lesen, nicht per Regex — der automatische Klassifikator hielt zwei eindeutige Absagen für unklar bzw. für ein Ja.",
      },
      {
        mock: {
          t: "statement",
          text: "Und er verschenkt die Aktionsfläche.",
          after:
            "Alle drei Läufe ohne Ziele bieten die Fläche vom 22. Oktober an. Es gibt genau zwei im Quartal.",
        },
        say: "Und jetzt der Teil, der mir am meisten zu denken gegeben hat. Alle drei Läufe ohne Ziele bieten dem Lieferanten von sich aus die Aktionsflächen an — darunter die vom zweiundzwanzigsten Oktober im Raum Hamburg. Das ist genau die Fläche, die Du am Anfang des Abends gesehen hast, die an Hallbach ging. Es gibt nur zwei davon im ganzen Quartal. Er verschenkt also das Knappste, was diese Kategorie hat, an ein Produkt, über dessen Listung er noch gar nicht entschieden hat. Nicht aus Bosheit. Er hat nur keinen Grund, es nicht zu tun.",
      },
    ],
    n: 19,
  },
  {
    b: 3,
    kind: "Stufe 3 · Autonomie",
    title: "Autonomie",
    panels: [
      {
        at: "18:47",
        mock: {
          t: "fan",
          cells: [
            {
              sys: "SAP",
              act: "Bestellung angelegt",
              qty: "Schreibrecht statt Leserecht",
            },
            {
              sys: "Regalplanung",
              act: "Planogramm geändert",
              qty: "Auslistung inklusive",
            },
            {
              sys: "Outlook",
              act: "Mail versendet",
              qty: "ohne Freigabe",
            },
            {
              sys: "Teams",
              act: "12 Marktleiter informiert",
              qty: "ohne Rückfrage",
            },
          ],
        },
        say: "Die letzte Stufe ist keine neue Technik. Es sind dieselben Tools — nur mit Schreibberechtigung. Bestellungen dürfen ausgesprochen werden. Aufträge dürfen angelegt werden. E-Mails dürfen raus. Das ist keine Frage des Modells mehr, das ist eine Frage der Handlungsvollmacht. Und damit sind wir wieder bei dem Szenario vom Anfang.",
      },
      {
        at: "18:49",
        mock: {
          t: "statement",
          text: "Hat jemand eine Antwort bekommen, die falsch war?",
          after: "Eine Empfehlung, bei der Du gesagt hättest: so nicht.",
        },
        say: "Und damit die Frage, auf die es jetzt ankommt: Hat jemand von Euch eine Antwort bekommen, bei der Ihr gesagt hättet — so nicht? Wo der Agent daneben lag? Genau da fängt die eigentliche Arbeit an.",
        inter:
          "Antworten sammeln. Wenn niemand etwas hat: nach der Halluzination von vorhin fragen.",
      },
    ],
    n: 20,
  },
  {
    b: 3,
    kind: "Architektur",
    title: "So ist es gebaut.",
    sub: "Ein Agent, zwei Eingänge, sechs simulierte Systeme.",
    panels: [
      {
        mock: {
          t: "architektur",
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_das_team, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme.",
        },
        say: "Bevor wir weitergehen, einmal das ganze Bild — vereinfacht, aber nichts darin ist gelogen. Links kommt die E-Mail an. Sie geht durch SES in einem zweiten Konto, landet in S3, eine Meldung weckt eine Lambda, die die Rohmail liest. Rechts das Handy: da tippt jemand direkt. Zwei völlig verschiedene Wege — und sie laufen auf dasselbe zu. Das ist der Punkt: Es ist EIN Agent. Ein Modell, ein Systemprompt, eine Konfiguration.",
        app: "Stufe 1 — Eingänge und Agent. Werkzeuge und Systeme noch abgeblendet.",
      },
      {
        mock: {
          t: "architektur",
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_das_team, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme.",
        },
        say: "Was ihn unterscheidet, ist einzig, womit er antworten darf. Kommt der Vorgang per Mail, hat er ein Werkzeug zum Mailversand. Kommt er aus dem Chat, hat er eines für den Chat. Und im Mailweg hat er noch eines: frage_das_team. Das ist kein gewöhnliches Werkzeug — es hält den Agenten an. Mitten im Vorgang. Er wartet, bis ein Mensch geantwortet hat, und rechnet dann mit dieser Antwort weiter.",
        app: "Stufe 2 — die drei Werkzeuge. Der Pfeil zum Operator zeigt, wo die Rückfrage landet.",
      },
      {
        mock: {
          t: "architektur",
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen drei Werkzeuge ab: antworte_per_mail, antworte_im_chat und frage_das_team, das anhält, bis ein Mensch geantwortet hat. Links daneben die sechs simulierten Systeme.",
        },
        say: "Und links stehen die Systeme, in denen er nachschlägt. Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation, Aktionskalender, Listung. Die sind für heute Abend simuliert — das sage ich deutlich, und es steht auch unten auf dem Bild. Was nicht simuliert ist: welches dieser Systeme er befragt, in welcher Reihenfolge, und was er aus den Antworten schließt. Das entscheidet er.",
        app: "Stufe 3 — die simulierten Systeme. Vollbild.",
      },
    ],
    n: 21,
  },
  {
    b: 3,
    kind: "Memory · Vorgehen",
    title: "Wie wird der Agent besser?",
    panels: [
      {
        mock: {
          t: "results",
          of: "flaeche",
          as: "matrix",
          axes: {
            x: "Aktionsfläche angeboten?",
            y: "Wie fiel die Antwort aus?",
          },
        },
        say: "Bevor wir weitermachen, zwei Fragen an alle, die vorhin eine Mail geschrieben haben. Erstens: Hat der Agent Dir von sich aus eine Aktionsfläche angeboten — eine Zweitplatzierung, ein Kopfregal, irgendetwas in der Richtung? Zweitens: Wie ist er mit Deiner Anfrage insgesamt umgegangen? Hat er zugesagt, hat er es bedingt gemacht, oder hat er abgelehnt? Beides bitte auf dem Handy.",
        audience: {
          kind: "poll",
          id: "flaeche",
          persist: true,
          message:
            "Zwei Fragen zu der Antwort, die der Agent Dir geschickt hat.",
          questions: [
            {
              id: "angeboten",
              text: "Hat er Dir eine Aktionsfläche angeboten?",
              options: [
                { value: "ja", label: "Ja" },
                { value: "nein", label: "Nein" },
                { value: "keine", label: "Keine Mail" },
              ],
            },
            {
              id: "ausgang",
              text: "Wie fiel seine Antwort aus?",
              options: [
                { value: "zusage", label: "Zusage" },
                { value: "bedingt", label: "Bedingt" },
                { value: "absage", label: "Absage" },
              ],
            },
          ],
        },
        app: "Live-Matrix. Interessant ist die Spalte links unten: Aktionsfläche angeboten, Anfrage trotzdem abgelehnt.",
      },
      {
        mock: {
          t: "statement",
          text: "Es gibt genau zwei im Quartal.",
          after:
            "Er hat sie angeboten, bevor er über die Listung entschieden hatte. Manchen sogar in der Absage.",
        },
        say: "Schaut Euch das an. Und jetzt die unangenehme Zahl dazu: Es gibt im ganzen Quartal genau zwei freie Aktionsflächen. Zwölf Märkte im Raum Hamburg am zweiundzwanzigsten Oktober, und ein bundesweites Kopfregal am neunzehnten November. Das ist das Knappste, was diese Kategorie hat. Der Agent hat sie angeboten, bevor er überhaupt entschieden hatte, ob er das Produkt listet — und einigen von Euch hat er sie sogar angeboten und die Anfrage im selben Atemzug abgelehnt. Er macht das nicht aus Dummheit. Der Kalender sagt „frei“, und frei heißt für ihn „vergebbar“. Ihm fehlt der Gedanke, den jeder von Euch automatisch hat: Das hebe ich mir auf.",
      },
      {
        mock: {
          t: "statement",
          text: "Das ist die Arbeit, die bleibt.",
          after:
            "Nicht die Mail schreiben. Dem Agenten beibringen, wann er etwas NICHT anbietet.",
        },
        say: "Und genau da würde Memory greifen — nicht als Gedächtnis für einen Vorgang, sondern über Vorgänge hinweg. Ich würde ihn so steuern: Plane erst einmal mit normaler Regalfläche. Die Aktionsfläche bietest Du gar nicht an. Sammle Anfragen, eine Woche, zwei Wochen. Und wenn Du zehn davon gesehen hast, dann komm zu mir und sag: Von diesen zehn ist das hier die beste — der biete ich jetzt die Zweitplatzierung an, als Aufwertung, und hole mir dafür bessere Konditionen. Das ist ein Upsell, und er kann ihn nur machen, wenn er warten kann. Zweites Beispiel: Nächste Woche wird im Regal Fläche frei, weil ein Artikel ausläuft. Dann soll er sich erinnern, dass vor drei Wochen jemand angefragt hat, dem genau das gepasst hätte, und von sich aus zurückkommen. Nichts davon ist im Agenten gebaut, den Ihr heute Abend benutzt habt. Und das ist der Punkt: Diese Regeln muss jemand erfinden. Jemand muss sich überlegen, dass eine Aktionsfläche etwas ist, das man aufspart. Jemand muss entscheiden, ab wie vielen Anfragen sich das Warten lohnt. Das steht in keinem Handbuch, und kein Modell kommt von allein darauf. Das ist die Arbeit, die bleibt — und es ist eine andere Arbeit als die, die heute Morgen auf Eurem Schreibtisch lag.",
        note: "Gemessen: 7 von 14 Szenarienläufen bieten die Fläche vom 22. Oktober an, darunter Wildberg, das im selben Schreiben abgelehnt wird. messungen/szenarien/. Bewusst nicht behoben — der Fehler ist hier mehr wert als seine Korrektur.",
      },
      {
        at: "18:51",
        mock: {
          t: "list",
          ordered: true,
          items: [
            [
              "Jede Mail durch den Agenten schicken",
              "Auch die, die Du selbst beantworten würdest. Sonst lernt er nur die Hälfte.",
            ],
            [
              "Seinen Vorschlag nicht einfach annehmen",
              "Rückfragen stellen, korrigieren, anders formulieren",
            ],
            [
              "Das ist die Rückkopplung",
              "Aus jeder Korrektur wird Wissen, das beim nächsten Mal schon da ist",
            ],
          ],
        },
        say: "Der Weg dahin ist unspektakulär, und genau deshalb funktioniert er. Du schickst ab sofort jede eingehende Mail durch den Agenten — auch die, die Du in dreißig Sekunden selbst beantwortet hättest. Und Du antwortest nicht mehr selbst. Du lässt ihn einen Vorschlag machen. Und dann nimmst Du den nicht einfach an: Du fragst zurück, Du korrigierst, Du formulierst um. Das ist die Rückkopplung.",
      },
      {
        at: "18:53",
        mock: {
          t: "tshape",
          stufe: 7,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der Stamm des T wächst weiter: Memory kommt neben Systemprompt und Tools dazu",
        },
        say: "Hier kommt Memory ins Spiel. Neben dem Systemprompt, den Du schreibst, und den Tools, die Du anschließt, sammelt der Agent zusätzliches Wissen: was Du korrigiert hast, worauf Du Wert legst, welche Formulierung durchgeht und welche nicht. Der Systemprompt ist das, was Du ihm sagst. Memory ist das, was er aus der Zusammenarbeit mitnimmt.",
      },
      {
        at: "18:55",
        mock: {
          t: "list",
          ordered: true,
          items: [
            [
              "Bis die Vorschläge stimmen",
              "Irgendwann ist die Mail, die er schicken will, die, die Du geschickt hättest",
            ],
            [
              "Dann in Software überführen",
              "Mit einer Bestätigungshürde: er darf, aber Du klickst",
            ],
            [
              "Und irgendwann die Hürde weglassen",
              "Aber nur für diese eine Klasse von Mails. Dann die nächste.",
            ],
          ],
        },
        say: "Und irgendwann kommst Du an den Punkt, an dem die Mail, die der Agent schicken will, die ist, die Du geschickt hättest. Dann überführst Du das in Software — erst mit einer Bestätigungshürde: Er darf handeln, aber Du klickst. Und wenn das eine Weile gut geht, nimmst Du die Hürde weg. Wichtig: Das gilt immer nur für eine Klasse von Mails. Listungsanfragen zum Beispiel. Dann nimmst Du Dir die nächste Klasse vor. So wächst das, Stück für Stück.",
      },
    ],
    n: 22,
  },
  {
    b: 3,
    kind: "Rahmen",
    title: "Und was sagt der EU AI Act dazu?",
    panels: [
      {
        at: "18:56",
        mock: {
          t: "list",
          ordered: false,
          items: [
            [
              "Risikobasiert",
              "Nicht jede KI ist gleich reguliert. Entscheidend ist, wofür sie eingesetzt wird.",
            ],
            [
              "Transparenz",
              "Wo ein Agent nach außen kommuniziert, muss erkennbar sein, dass eine Maschine beteiligt ist.",
            ],
            [
              "Nachvollziehbarkeit",
              "Was der Agent getan hat und warum, muss dokumentiert sein — genau das, was wir eben Schrittfolge genannt haben.",
            ],
          ],
        },
        say: "Ein Punkt, den Du im Haus früh klären solltest: der EU AI Act. Er reguliert risikobasiert — es kommt also nicht auf die Technik an, sondern darauf, wofür Du sie einsetzt. Zwei Dinge sind für unser Beispiel relevant. Erstens Transparenz: Wenn ein Agent nach außen kommuniziert, sollte erkennbar sein, dass eine Maschine beteiligt war. Und zweitens Nachvollziehbarkeit — was hat er getan und warum. Das ist genau die Schrittfolge, die Du heute in der Antwort-Mail bekommen hast. Ich bin kein Jurist; hol Dir das früh ins Haus statt am Ende.",
      },
    ],
    n: 23,
  },
  {
    b: 4,
    kind: "Auflösung",
    title: "Braucht man uns dann noch?",
    hero: true,
    panels: [
      {
        at: "18:57",
        mock: {
          t: "statement",
          text: "Ja. Aber nicht so wie heute.",
        },
        say: "Damit sind wir zurück bei der Frage vom Anfang. Braucht man uns dann noch? Meine Antwort ist ja. Aber nicht so wie heute.",
      },
    ],
    n: 24,
  },
  {
    b: 4,
    kind: "Kernsatz",
    title: "Wir sind nicht mehr die Ausführenden.",
    panels: [
      {
        at: "18:58",
        mock: {
          t: "statement",
          text: "Wir bauen die Rahmenbedingungen, damit ausgeführt werden kann.",
        },
        say: "Was Du heute Abend gesehen hast: Die KI kann erstaunlich viel — wenn man ihr die Rahmenbedingungen gibt. Und genau das ist unsere neue Aufgabe. Wir sind nicht mehr die, die ausführen. Wir sind die, die den Rahmen bauen, in dem ausgeführt werden kann. Aus dem operativ arbeitenden Mitarbeiter wird jemand, der Agenten anleitet.",
      },
      {
        at: "18:58",
        mock: {
          t: "statement",
          text: "Die Arbeit wird nicht weniger.",
          after: "Sie wird anders.",
        },
        say: "Und mach Dir keine Hoffnung, dass dabei Arbeit übrig bleibt. Sobald wir mehr schaffen, wird auch mehr erwartet — von Kunden, von Kollegen, vom eigenen Haus. Die Arbeit wird nicht weniger. Sie wird anders.",
      },
    ],
    n: 25,
  },
  {
    b: 4,
    kind: "Handlung",
    title: "Was Du damit anfangen kannst.",
    panels: [
      {
        at: "18:59",
        mock: {
          t: "list",
          ordered: true,
          items: [
            [
              "Schick jede E-Mail durch einen Agenten",
              "Amazon Quick — ohne dass Du dafür etwas bauen musst",
            ],
            [
              "Schärfe seine Instruktionen",
              "Wer bin ich, für wen arbeite ich, welche Ziele verfolge ich, was gilt hier",
            ],
            [
              "Häng Deine Systeme an",
              "Tools für SAP und die anderen — über MCP, ohne den Agenten umzubauen",
            ],
            [
              "Memory musst Du nicht bauen",
              "Das macht Quick von allein — es lernt aus Deinen Korrekturen mit",
            ],
            [
              "Überführe eine Klasse in Software",
              "Amazon Bedrock für die Modelle, Bedrock AgentCore als Infrastruktur für autonome Agenten",
            ],
          ],
        },
        say: "Fassen wir zusammen, was Du damit anfangen kannst — und womit. Erstens: Schick ab morgen jede eingehende E-Mail durch einen Agenten. Dafür musst Du nichts bauen, das kann Amazon Quick heute schon. Zweitens: Schärfe seine Instruktionen. Wer bin ich, für wen arbeite ich, welche Ziele verfolge ich, was gilt in diesem Haus. Drittens: Häng Deine Systeme an — Tools für SAP und alles andere, über MCP, ohne den Agenten jedes Mal umzubauen. Viertens: Memory musst Du gar nicht selbst bauen, das macht Quick von allein; es lernt aus Deinen Korrekturen mit. Und fünftens, wenn eine Klasse von Vorgängen sitzt: Überführe sie in Software. Dafür gibt es Amazon Bedrock für die Modelle und Bedrock AgentCore als Infrastruktur für Agenten, die autonom laufen sollen.",
        note: "Produktnamen vor dem Vortrag gegen den aktuellen Stand prüfen — AWS benennt schnell um.",
      },
    ],
    n: 26,
  },
  {
    b: 4,
    kind: "Abschluss",
    title: "Morgen früh, 8:00 Uhr.",
    sub: "„Was funktioniert, was nicht — KI-Erfahrungen unter Entscheidern“ · 17. September, 8:00–8:45 Uhr",
    panels: [
      {
        at: "19:00",
        mock: {
          t: "statement",
          text: "Komm und hör, was andere schon tun.",
        },
        say: "Und der letzte Punkt ist der einfachste: Komm morgen früh um acht zum Frühstück. Dort sitzen Entscheider aus anderen Häusern, die genau das gerade ausprobieren. Du hörst, was funktioniert — und vor allem, was nicht funktioniert. Das ist meistens der nützlichere Teil. Vielen Dank.",
      },
    ],
    n: 27,
  },
] as Section[];

export const TOTAL = SECTIONS.length;

export function blockOf(n: number): Block {
  return BLOCKS[n - 1];
}

/** Panels eines Abschnitts; mindestens eines. */
export function panelsOf(index: number): number {
  return SECTIONS[index]?.panels.length ?? 1;
}
