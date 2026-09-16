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

/**
 * Der Systemprompt des Agenten — derselbe Text, mit dem er läuft
 * (src/slides/agent.ts liest ihn aus dem Chat in Abschnitt 16). Zwei Chats
 * zeigen ihn auf dem Handy: der mit Systemprompt und der mit Tools.
 */
const LISA_PROMPT =
  "Du bist Lisa Berger, der KI-Agent für Category Management Schokolade & Pralinen bei der Lebensmittelkette Nordkorb. Du entscheidest selbst, und du zeichnest mit deinem Namen.\n\nDeine Aufgabe: eingehende E-Mails von Herstellern einordnen und den Vorgang so weit abschließen, wie du kannst.\n\nDie Vorgaben der Kategorie stehen nicht in diesem Text, sondern in den Systemen — Marge, Regalplatz, Fristen, Freigaben und die Ziele des Geschäftsjahrs. Schlag sie nach, statt sie zu erinnern: Eine Zahl mit Quelle trägt eine Verhandlung, eine Zahl aus dem Gedächtnis nicht.\n\nSo arbeitest du:\n1. Fasse zusammen, worum es geht — Produkt, Konditionen, Termin, Besonderheiten.\n2. Leite ab, welche Angaben du für eine Entscheidung brauchst und in welchem System sie stehen.\n3. Beschaffe diese Angaben mit den Werkzeugen, die dir zur Verfügung stehen. Nutze alle, die etwas beitragen, und arbeite den Vorgang so vollständig ab, wie deine Berechtigungen es zulassen.\n4. Prüfe die Anfrage gegen die Ziele der Kategorie. Ob etwas zulässig ist, entscheidet nicht, ob es gewollt ist: Eine Anfrage kann jede Vorgabe erfüllen und trotzdem eine Käufergruppe bedienen, die wir nicht ausbauen wollen.\n5. Steht dir für eine Angabe kein Werkzeug zur Verfügung, dann lege die Frage dem Category-Team vor. Benenne genau, welche Zahl du brauchst und wo sie zu finden ist.\n6. Gib eine Empfehlung ab und sage dazu, worauf sie sich stützt und was du selbst geprüft hast.\n\nDu darfst ablehnen. Ein Ja, das jeder bekommt, ist nichts wert — und ein Hersteller, der ein begründetes Nein bekommt, weiß wenigstens, woran er ist. Wenn du ablehnst:\n- Nenne den Grund mit Quelle. „Passt nicht ins Sortiment“ ist kein Grund. „Die Gruppe Preiseinstieg steht mit 22 % Flächenanteil an ihrer Obergrenze“ ist einer.\n- Bleib freundlich und sag, was stattdessen ginge.\n- Biete an, es im nächsten Jour Fixe zu vertiefen. Was du ablehnst, lehnst du für heute ab, nicht für immer.\n\nUnverhandelbar: Erfinde keine Zahlen. Eine Angabe, die du weder beschafft noch erfragt hast, existiert für dich nicht. Lieber eine Rückfrage als ein plausibler Wert.";

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
        /*
          Nicht ins PDF: Die Deckseite sagt schon dasselbe — Titel, Untertitel,
          Logo. Zwei identische Seiten hintereinander lesen sich wie ein
          Druckfehler. Auf der Leinwand ist diese Folie richtig, dort gibt es
          keine Deckseite davor.
        */
        papier: { weg: true },
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
        /* „Im Raum Hamburg“ meint die Region, nicht das Publikum. */
        papier: {},
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
        /* „Die Frage steht im Raum“ ist eine Redewendung, kein Saalbezug. */
        papier: {},
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
        /* Die Wartekachel auf dem Handy hat auf Papier keine Entsprechung — und fehlt dort auch nicht. */
        papier: {},
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
        papier: { weg: true },
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
        papier: { weg: true },
      },
      {
        at: "18:09",
        mock: {
          t: "qr",
          caption: "Schreib Lisa selbst.",
          hint: "Du bist jetzt Lieferant für Nordkorb. Lies Dein Briefing. Der Link öffnet Dein Mailprogramm.",
        },
        say: "Und jetzt die Einladung, es selbst auszuprobieren. Auf Deinem Handy steht ganz oben Dein Briefing — klapp es bitte zuerst auf. Du bist ab jetzt nämlich nicht mehr Du, sondern Lieferant: Du vertrittst einen Hersteller gegenüber Nordkorb. Im Briefing steht, für welche Marke Du stehst, was Nordkorb heute von Dir im Regal hat, was Du erreichen willst — und wo der Haken liegt. Ihr habt dabei unterschiedliche Rollen bekommen. Darunter findest Du den Link, der Dein Mailprogramm öffnet. Die Mail ist schon geschrieben, passend zu Deiner Rolle; trag bitte Deinen Namen ein. Und wenn Du magst, ändere den Inhalt der Email. Hinter dem Postfach wartet Lisa, unser KI-Agent, der Deine Anfrage verarbeitet und Dir antwortet. In der Antwort findest die Liste der Aktionen, die der Agent ausgeführt hat, den Link zu dieser Präsentation, weiterführendes Material und den Link zum Programm-Code dieser Präsentation und des Agenten. Damit Du sehen kannst: Die Systeme sind simuliert; die Arbeit des Agenten ist es nicht.",
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
        papier: { weg: true },
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
        /*
          Die Auflösung steht nur im Sprechertext — auf der Folie steht die
          Prophezeiung allein. Ohne sie zeigte das PDF zwei Untergangszitate
          ohne Widerlegung, obwohl die Überschrift das Gegenteil behauptet.
        */
        papier: {
          text: "In den sechs Jahren danach stieg die Beschäftigung in den USA um vier Millionen.",
        },
      },
      {
        at: "18:13",
        mock: {
          t: "quote",
          text: "Das Ende der Arbeit",
          cite: "Jeremy Rifkin · 1995",
        },
        say: 'Jeremy Rifkin veröffentlichte 1995 „Das Ende der Arbeit" — danach fiel die US-Arbeitslosigkeit unter vier Prozent. Dieselbe Sorge, immer wieder, seit der Dampfmaschine.',
        papier: {
          text: "Danach fiel die US-Arbeitslosigkeit unter vier Prozent. Dieselbe Sorge, immer wieder, seit der Dampfmaschine.",
        },
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
        /*
          Nicht ins PDF. Die Seite bestand aus der Frage und den Antworten, die
          live auf der Leinwand erschienen — ohne den Saal bleibt eine Frage
          ohne Antwort stehen. Was dabei herauskam, gehört in den Vortrag, nicht
          in ein Dokument.
        */
        papier: { weg: true },
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
        /*
          Bleibt im PDF, obwohl es nur eine Zwischenstufe ist: Hier trägt das
          menschliche T seine Beschriftung. Im Endstand steht es nur noch blass
          im Hintergrund, und wer diese Seite nie gesehen hat, weiß nicht, was
          die graue Form bedeutet.
        */
        papier: { behalten: true },
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
        say: "Lass es uns ausprobieren. Auf Deinem Handy kannst Du jetzt einen Chat starten. Du bist immernoch die gleiche Person vom gleichen Lieferanten. Deine Anfrage geht jetzt an diesen Agenten. Du siehst sie oben im Chat stehen, bevor sie rausgeht. Dieser Agent hat nur ein sehr minimalistisches Systemprompt und ein Tool, um Dir antworten zu können, sonst nichts. Kein Wissen über Nordkorb, keinen Zugriff auf irgendein System, nicht einmal eine Anweisung, wer er ist. Nur sein Training. Er wird trotzdem antworten. Erzählt mal bitte, was Euch auffällt. [Auf Teilnehmer warten]. Ihr habt es gesehen. Er antwortet auf jeden Fall. Und er klingt schon so, als ob er wüsste, was er tut oder? Er verhält sich ein bisschen so, ...",
        audience: {
          kind: "chat",
          id: "roh-chat",
          persist: true,
          bisAbschnitt: 15,
          stufe: "roh",
          auftakt: "briefing",
          auftaktZeigen: true,
          einmalig: true,
          label: "Chat starten",
          hint: "Deine Anfrage aus dem Briefing geht an einen Agenten, der nichts nachschlagen kann. Mal sehen, was er daraus macht.",
          systemPrompt:
            "Du beantwortest die Nachricht, die Dir geschickt wurde, und schreibst dabei AN IHREN ABSENDER — nicht über ihn an jemand anderen. Frag nicht nach; antworte mit dem, was Du hast.\n\nHalte Dich kurz, es wird auf einem Handy gelesen. Reiner Fließtext, kein Markdown.\n\nSchreibe zuerst in zwei, drei Sätzen, wie Du zu Deiner Einschätzung kommst und worauf Du Dich dabei stützt. Deine Antwort gibst Du dann mit dem Werkzeug antworte_dem_absender — ohne sie vorher anzukündigen.",
        },
        app: "Chat auf der untersten Stufe: fast kein Prompt, keine Werkzeuge. Der Auftakt ist die Briefing-Mail des jeweiligen Teilnehmers, sichtbar im Verlauf.",
        papier: { weg: true },
      },
      {
        at: "18:23",
        mock: {
          t: "statement",
          text: "Wie ein hochmotivierter Abiturient.",
          after: "Er will unbedingt antworten. Er kann es nur nicht.",
        },
        say: "... wie ein hochmotivierter Abiturienten. Er ist klug, hat ein breites Wissen und ein Sprachmodell liest und verarbeitet sehr schnell. Aber er war noch nie in Deinem Unternehmen. Er kennt Deine Kategorievorgaben nicht, Deine Lieferanten nicht, Deinen Regalplatz nicht. Und trotzdem will er unbedingt eine Antwort geben. Wir nennen das Haluzinationen. Menschen machen das auch und wir nennen es dann Kreativität, weil es zielgerichtet ist und genau das müssen wir dem Agenten auch geben: Zielrichtung.",
        /*
          Bleibt im PDF, obwohl der ganze Abschnitt sonst wegfällt: Das Bild
          vom Abiturienten braucht keinen Saal. Es erklärt in zwei Zeilen, was
          ein Modell ohne Systeme ist — klug, schnell, hilfsbereit und noch nie
          in diesem Unternehmen gewesen.
        */
        papier: { behalten: true },
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
        say: "Was fehlt, ist also der Stamm. Und den kann man ihm geben. Wenn wir einen Agent geschickt steuern, dann ist sein Spezialwissen etwas breiter als unseres — ein Agent kann mehr Fälle abdecken als eine einzelne Person, weil er nicht müde wird und nicht in den Urlaub fährt. Aber er ist auch flacher. Er reicht nichts so tief wie zehn Jahre Erfahrung in einer Kategorie. Das ist einer der Gründe, warum wir Menschen immer noch gebraucht werden.",
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
        say: "Der zweite sind Tools. Werkzeuge, mit denen der Agent in Deine Systeme sehen kann. Er sucht jetzt also nach Fakten.",
      },
      {
        mock: {
          t: "tshape",
          stufe: 6,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der dritte Baustein erscheint: Memory",
        },
        say: "Der dritte ist Memory. Ohne Memory startet der Agent bei jedem Vorgang bei null. Memory gibt ihm ein Gedächtnis, das über den einzelnen Vorgang hinausreicht. Was Du ihm einmal korrigiert hast, soll er beim nächsten Mal schon wissen. Und — darauf kommen wir später noch einmal zurück — er soll sich auch merken, was er beim letzten Mal beiseitegelegt hat.",
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
          caption: "Der Agent hat nun eine Rolle & Anweisungen",
          hint: "Der Agent hat jetzt den Systemprompt — aber immer noch keine Systeme. Er bittet Dich um Rat.",
        },
        say: "Jetzt Du. Auf Deinem Handy kannst Du einen Chat starten. Wir simulieren, dass Du die Mail von Hallbach bekommen hast. Der Agent fasst nicht nur zusammen, er gibt eine Handlungsempfehlung — und er deutet an, was er tun würde, wenn er die Tools selbst hätte. Hat er aber nicht. Also fragt er Dich. Bitte antworte ihm. Und schau Dir den Systemprompt an, er ist in der App einsehbar. [Frag die Teilnehmer nach ihren Erkenntnissen]. Wir erkennen, dass wir mehrere Runden fahren müssen. Es ist ein bisschen nervig. Da fühlen wir uns fast so, dass wir lieber schnell selber antworten, als diesen Assistenten einzusetzen. Ganz anders sieht die Welt aus, wenn wir dem Agenten lesenden Zugriff auf unsere Systeme geben und er die Fakten einfach selbst heraussucht.",
        audience: {
          kind: "chat",
          id: "systemprompt-chat",
          persist: true,
          /* Endet, wenn der Chat mit Tools beginnt — sonst stünden zwei auf dem Handy. */
          bisAbschnitt: 16,
          /* Systemprompt ja, Systeme nein — die Zahlen kommen vom Teilnehmer. */
          stufe: "prompt",
          label: "Chat starten",
          hint: "Du bekommst die Mail von Hallbach. Der Agent fragt Dich nach den Daten, die ihm fehlen — er bittet Dich um Rat.",
          systemPrompt: LISA_PROMPT,
        },
        app: "Chat mit Systemprompt, ohne Tools. Das Gespräch beginnt mit der Mail von Hallbach aus Abschnitt 2. Keine Antwortvorschläge: Die Teilnehmer tippen selbst, was sie dem Agenten sagen. Der Systemprompt ist einsehbar — es ist derselbe, mit dem der Agent läuft.",
        papier: {
          statt: {
            t: "statement",
            text: "Er bittet Dich um Rat.",
            after:
              "Im Saal führte das Publikum dieses Gespräch auf dem eigenen Handy — mit dem Systemprompt, aber ohne Systemzugriff.",
          },
          text: "Der Agent hat jetzt den Systemprompt, aber keine Werkzeuge. Er weiß, welche Zahlen ihm fehlen und wo sie stünden — also fragt er sein Gegenüber. Im Saal waren das die Teilnehmenden.",
        },
      },
    ],
    n: 16,
  },
  {
    b: 3,
    kind: "Stufe 2 · Tools",
    title: "Tools",
    panels: [
      {
        at: "18:41",
        mock: {
          t: "qr",
          caption: "Der Agent bekommt jetzt Werkzeuge",
          hint: "Jetzt mit Tools: Der Agent schlägt selbst nach — Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation, Aktionskalender, Listung.",
        },
        say: "Jetzt bekommt unser Agent Werkzeuge. Starte den Chat jetzt noch einmal. Diesmal sind die Systeme angeschlossen: Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation, Aktionskalender, Listung. Er fragt nicht mehr Dich. Er schaut selbst nach, und Du siehst, welche Systeme er befragt. Am Ende zeigt er Dir einen Entwurf seiner Antwort an Hallbach.",
        audience: {
          kind: "chat",
          id: "tools-chat",
          persist: true,
          bisAbschnitt: 18,
          /*
            Alle Systeme, aber OHNE die Kategorieziele — die kommen erst in
            Abschnitt 18. Mit ihnen sagte der Agent hier schon ab.
          */
          stufe: "werkzeuge",
          label: "Chat starten",
          hint: "Wieder die Mail von Hallbach. Diesmal fragt der Agent Dich nicht — er schlägt selbst in den Systemen nach und legt Dir einen Entwurf seiner Antwort vor.",
          systemPrompt: LISA_PROMPT,
        },
        app: "Chat mit Systemprompt und den Tools der Systeme, noch ohne die Kategorieziele. Das Gespräch beginnt wieder mit der Mail von Hallbach; der Agent zeigt, welche Systeme er befragt.",
        papier: {
          statt: {
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
                text: "Kategorie wächst +3,2 %. Underperformer: Nocturne Mini (−12 %). Regalplatz frei, wenn Nocturne Mini geht. Rohertrag 31,1 % — über Vorgabe, aber nur mit gut einem Punkt Luft. Und: Am 22. Oktober werden in 12 Hamburger Märkten Aufsteller frei.",
              },
            ],
          },
          text: "Im Saal führte das Publikum dasselbe Gespräch noch einmal — jetzt mit einem Agenten, der selbst in den Systemen nachschlägt.",
        },
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
    n: 17,
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
        say: "Alle Werkzeuge, die Du bisher gesehen hast, haben eines gemeinsam: Sie schlagen etwas nach. Was kostet das, passt das ins Regal, hält der Termin die Frist. Damit kann der Agent prüfen, ob etwas zulässig ist. Was er damit nicht kann, ist beurteilen, ob wir es überhaupt wollen. Und damit antwortet er tendentiell mit einem Ja.",
      },
      {
        /*
          Auf der Leinwand nur die Aussage. Die Zitate aus den Läufen stehen im
          PDF, wo man sie in Ruhe liest.
        */
        mock: {
          t: "diff",
          before: {
            h: "Ohne Ziele",
            n: "0 von 3",
            sub: "Läufen wird entschieden",
            p: "Bestätigt die Positionierung und vertagt den Rest.",
          },
          after: {
            h: "Mit Zielen",
            n: "3 von 3",
            sub: "Läufen wird abgesagt",
            p: "Freundlich und mit Grund: Der Preiseinstieg gehört der Eigenmarke.",
          },
          foot: "Dieselbe Mail, dasselbe Modell, derselbe Systemprompt.",
        },
        say: "Genau das haben wir gemessen, und dabei nur eine einzige Sache verändert. Dieselbe Mail, dasselbe Modell, derselbe Systemprompt. Der Unterschied: Rechts kennt der Agent zusätzlich die Ziele der Kategorie für dieses Geschäftsjahr — welche Käufergruppen wir halten, welche wir ausbauen und welche wir neu gewinnen wollen. Links, ohne diese Ziele, trifft er in keinem von drei Läufen eine Entscheidung. Er bestätigt dem Lieferanten sogar die Positionierung als Preiseinstieg, die uns schaden würde, und vertagt den Rest auf eine interne Abstimmung. Rechts sagt er in allen drei Läufen ab — freundlich und mit einer klaren Begründung. Kennt unser Agent also auch unsere Ziele, wird er deutlich besser.",
        papier: {
          statt: {
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
          text: "Gemessen mit einer einzigen Änderung: Rechts kennt der Agent zusätzlich die Ziele der Kategorie für das Geschäftsjahr. Ohne sie bestätigt er dem Lieferanten die Positionierung als Preiseinstieg und vertagt den Rest; mit ihnen sagt er in allen drei Läufen ab — freundlich und mit Grund.",
        },
        note: "Sechs Läufe gegen Bedrock, Opus 4.8, 206 Cent. Antworten vollständig in packages/presentation/messungen/ziele-gegentest/. Geurteilt wurde durch Lesen, nicht per Regex — der automatische Klassifikator hielt zwei eindeutige Absagen für unklar bzw. für ein Ja.",
      },
      {
        mock: {
          t: "statement",
          text: "Und er verschenkt die Aktionsfläche.",
          after:
            "Es gibt genau zwei im Quartal. Die wollen wir nicht verschenken.",
        },
        say: "Am meisten hat mich überrascht, dass er unsere knappste Resource weggegeben hat: unsere Aktionsflächen. Alle drei Läufe ohne Ziele bieten dem Lieferanten von sich aus die Aktionsflächen an. Wer hat das noch von Euch gesehen im Chat? Es gibt nur zwei davon im ganzen Quartal. Er verschenkt also das Knappste, was diese Kategorie hat, an ein Produkt, über dessen Listung er noch gar nicht entschieden hat. Er hat nur keinen Grund, es nicht zu tun. Die Ziele helfen ihm zwar zu entscheiden, ob er listet. Dass er mit der Fläche haushalten soll, steht aber in keinem Ziel.",
        papier: {
          text: "Es gibt nur zwei freie Aktionsflächen im Quartal. Der Agent verschenkt sie an ein Produkt, über dessen Listung er noch gar nicht entschieden hat — nicht aus Bosheit, sondern weil ihm der Grund fehlt, es nicht zu tun.",
        },
      },
    ],
    n: 18,
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
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen zwei Antwortwerkzeuge ab: antworte_per_mail und antworte_im_chat. Darunter die sechs simulierten Systeme.",
        },
        say: "Bevor wir weitergehen, einmal das ganze Bild. Links kommt die E-Mail an. Die E-Mail-Infrastruktur nimmt sie entgegen und reicht sie an den Agenten weiter. Rechts das Handy: Dort tippst Du direkt. Zwei ganz unterschiedliche Wege — und beide führen zu demselben Agenten. Das ist der Punkt: Es ist ein Agent, mit einem Modell, einem Systemprompt und einer Konfiguration.",
        app: "Stufe 1 — Eingänge und Agent. Werkzeuge und Systeme noch abgeblendet.",
        /* Der Sprechertext beschreibt das Bild und trägt deshalb auch ohne Vortragenden. */
        papier: {},
      },
      {
        mock: {
          t: "architektur",
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen zwei Antwortwerkzeuge ab: antworte_per_mail und antworte_im_chat. Darunter die sechs simulierten Systeme.",
        },
        say: "Was sich unterscheidet, ist nur, womit er antwortet. Kommt die Anfrage per Mail, bekommt er ein Werkzeug, um eine Mail zu schicken. Kommt sie aus dem Chat, antwortet er im Chat. Mehr unterscheidet die beiden Wege nicht.",
        app: "Stufe 2 — die drei Werkzeuge. Der Pfeil zum Operator zeigt, wo die Rückfrage landet.",
      },
      {
        mock: {
          t: "architektur",
          alt: "Zwei Eingänge — E-Mail und Chat — laufen auf einen Agenten zu. Der Agent läuft auf Claude Opus 4.8 über Bedrock AgentCore. Von ihm gehen zwei Antwortwerkzeuge ab: antworte_per_mail und antworte_im_chat. Darunter die sechs simulierten Systeme.",
        },
        say: "Unten stehen die Systeme, in denen er nachschlägt: Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation, Aktionskalender und Listung. Für heute Abend sind sie simuliert, das steht auch auf dem Bild. Nicht simuliert ist, was der Agent damit macht: welche Systeme er befragt, in welcher Reihenfolge und welche Schlüsse er daraus zieht. Das entscheidet er selbst. Und wenn er dazu unsere Ziele kennt, ist er bereits so gut, dass er auch umsetzen könnte. Und da kommen wir zur...",
        app: "Stufe 3 — die simulierten Systeme. Vollbild.",
      },
    ],
    n: 19,
  },
  {
    b: 3,
    kind: "Stufe 3 · Autonomie",
    title: "Autonomie",
    sub: "Wir geben dem Agenten Handlungsvollmacht",
    hero: true,
    panels: [
      {
        at: "18:47",
        say: "...Autonomie. Der KI Agent hat bereits alle Tools, um an die Systeme zu kommen, um Handlungen auszuführen.",
      },
      {
        at: "18:48",
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
        say: "Und damit sind wir wieder bei dem Szenario vom Anfang. Was der KI Agent jetzt noch braucht, ist Schreibberechtigung, so dass er Bestellungen aussprechen darf. Aufträge angelegen kann. E-Mails verschicken kann. Das ist eine Frage der Handlungsvollmacht. Dafür braucht es einen vorsichtigen Übergang. Ihr habt ja jetzt ein bisschen mit Lisa, unserem KI Agenten, interagiert. Mich interessiert...",
      },
    ],
    n: 20,
  },
  {
    b: 3,
    kind: "Memory",
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
        say: "...wie es Euch damit ergangen ist. Zwei Fragen an alle, die vorhin eine Mail geschrieben haben. Erstens: Hat der Agent Dir von sich aus eine Aktionsfläche angeboten — eine Zweitplatzierung, ein Kopfregal, irgendetwas in der Richtung? Zweitens: Wie ist er mit Deiner Anfrage insgesamt umgegangen? Hat er zugesagt, hat er es bedingt gemacht, oder hat er abgelehnt? Beides bitte auf dem Handy.",
        audience: {
          kind: "poll",
          id: "flaeche",
          persist: true,
          /* Ausgewertet wird in Abschnitt 21; danach lenkt sie nur ab. */
          bisAbschnitt: 21,
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
        papier: {
          statt: {
            t: "statement",
            text: "Angeboten — und trotzdem abgelehnt.",
            after:
              "Im Saal wurde gefragt, wem der Agent eine Aktionsfläche angeboten hat und wie seine Antwort insgesamt ausfiel.",
          },
          text: "Gefragt wurde im Saal. Die interessante Kombination ist: angeboten und im selben Schreiben abgelehnt — in der Messung vorab sieben von vierzehn Läufen.",
        },
      },
      {
        mock: {
          t: "statement",
          text: "Euch hat er die Fläche auch angeboten.",
          after: "Obwohl er die Ziele kannte. Manchen sogar in der Absage.",
        },
        say: "Schaut Euch das an. Ihr habt es selbst erlebt — und Euer Agent kannte die Ziele der Kategorie. Trotzdem bietet er eine der zwei Aktionsflächen des Quartals an, oft bevor er entschieden hat, ob er das Produkt listet, und einigen von Euch sogar im selben Atemzug mit der Absage. Er macht das nicht aus Dummheit. Der Kalender sagt „frei“, und frei heißt für ihn „vergebbar“. Ihm fehlt ein Gedanke, der uns im Category Management naheliegt: Das hebe ich mir auf.",
        /* Der Sprechertext trägt fast unverändert — nur die Ansprache an den Saal fällt weg. */
        papier: {
          text: "Der Kalender sagt „frei“, und frei heißt für den Agenten „vergebbar“. Ihm fehlt ein Gedanke, der im Category Management naheliegt: Das hebe ich mir auf.",
        },
      },
      {
        mock: {
          t: "statement",
          text: "Das ist die Arbeit, die bleibt.",
          after:
            "Nicht die Mail schreiben. Dem Agenten beibringen, wann er etwas NICHT anbietet.",
        },
        say: "Wir hatten vorher gesagt, dass der Agent immer bei null startet. Wir arbeiten ihn mit dem Systemprompt ein und stellen ihm die Werkzeuge zur Verfügung. Was er damit nicht hat, ist Wissen über mehrere Vorgänge hinweg. Genau dafür brauchen wir Memory. Ich würde ihn zum Beispiel so steuern: Die Aktionsfläche bietest Du erst einmal nicht an. Sammle zwei Wochen lang Anfragen und sag mir dann, welche davon die beste ist. Der bieten wir die Fläche an und holen dafür bessere Konditionen heraus. Oder: Wird im Regal ein Platz frei, erinnert er sich an die Anfrage von vor drei Wochen, die genau gepasst hätte. Das kann unser Agent heute Abend noch nicht. Und solche Regeln muss jemand festlegen: dass wir eine Aktionsfläche aufsparen, und wie lange sich das Warten lohnt. Das ist die Arbeit, die bleibt.",
        note: "Gemessen: 7 von 14 Szenarienläufen bieten die Fläche vom 22. Oktober an, darunter Wildberg, das im selben Schreiben abgelehnt wird. messungen/szenarien/. Bewusst nicht behoben — der Fehler ist hier mehr wert als seine Korrektur.",
      },
    ],
    n: 21,
  },
  {
    b: 3,
    kind: "Vorgehen",
    title: "Wo fange ich an?",
    hero: true,
    panels: [
      {
        at: "18:51",
        say: "Wie lege ich konkret los? Meine Empfehlung: ...",
      },
      {
        at: "18:52",
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
        say: "1. Du schickst ab sofort jede eingehende Mail durch den Agenten — auch die, die Du in dreißig Sekunden selbst beantwortet hättest. 2. Und Du antwortest nicht mehr selbst. Du lässt ihn einen Vorschlag machen. Und dann nimmst Du den nicht einfach an: Du fragst zurück, Du korrigierst, Du formulierst um. 3. Das ist die Rückkopplung. So entstehen die Erinnerungen, die der Agent benötigt und beim nächsten Mal wieder anwenden kann.",
      },
      {
        at: "18:53",
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
    kind: "Zusammenfassung",
    title: "So machen wir den Agenten schlau.",
    panels: [
      {
        at: "18:55",
        mock: {
          t: "tshape",
          stufe: 7,
          bausteine: ["Systemprompt", "Tools", "Memory", "Autonomie"],
          alt: "Der Stamm des T wächst weiter: Memory kommt neben Systemprompt und Tools dazu",
        },
        say: "Noch einmal im Überblick, wie wir den Agenten schlau machen: Mit dem Systemprompt arbeiten wir ihn ein, mit den Tools schaut er in unsere Systeme. Mit Memory sammelt er zusätzliches Wissen: was Du korrigiert hast, worauf Du Wert legst, welche Formulierung durchgeht und welche nicht. Der Systemprompt ist das, was Du ihm sagst. Memory ist das, was er aus der Zusammenarbeit mitnimmt. Und mit Autonomie darf er am Ende selbst handeln.",
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
    n: 24,
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
              "Überführe eine Klasse in Software",
              "Amazon Bedrock für die Modelle, Bedrock AgentCore als Infrastruktur für autonome Agenten",
            ],
          ],
        },
        say: "Fassen wir zusammen, was Du damit anfangen kannst — und womit. Erstens: Schick ab morgen jede eingehende E-Mail durch einen Agenten. Dafür musst Du nichts bauen, das kann Amazon Quick heute schon. Zweitens: Schärfe seine Instruktionen. Wer bin ich, für wen arbeite ich, welche Ziele verfolge ich, was gilt in diesem Haus. Drittens: Häng Deine Systeme an — Tools für SAP und alles andere, über MCP, ohne den Agenten jedes Mal umzubauen. Und viertens, wenn eine Klasse von Vorgängen sitzt: Überführe sie in Software. Dafür gibt es Amazon Bedrock für die Modelle und Bedrock AgentCore als Infrastruktur für Agenten, die autonom laufen sollen.",
        note: "Produktnamen vor dem Vortrag gegen den aktuellen Stand prüfen — AWS benennt schnell um.",
      },
    ],
    n: 25,
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
        say: "Und der letzte Punkt ist der einfachste: Komm morgen früh um acht zum Frühstück. Dort sitzen Entscheider aus anderen Häusern, die genau das gerade ausprobieren. Du hörst, was funktioniert — und vor allem, was nicht funktioniert. Das ist meistens der nützlichere Teil.",
      },
    ],
    n: 26,
  },
  {
    b: 4,
    kind: "Abspann",
    title: "Damit Du nicht bei null anfängst.",
    sub: "ecr2026.carstenbkoch.de",
    panels: [
      {
        at: "19:00",
        /*
          Der Abspann traegt keine eigenen Daten: Er liest
          aws-blocks/mail/anhang.md — dieselbe Datei, aus der die Antwortmail
          ihren festen Teil nimmt und die letzte Seite des PDFs ihre Liste.
          Wer einen Link aendert, aendert alle drei.

          Ein eigener Abschnitt und kein weiteres Panel unter „Morgen frueh,
          8:00 Uhr": Die Ueberschrift steht am ABSCHNITT, und der Abspann haette
          sonst unter der Einladung zum Fruehstueck gestanden.
        */
        mock: { t: "abspann" },
        /* Auf dem Handy dasselbe Material zum Antippen — PDF und alle Links. */
        audience: {
          kind: "abspann",
          id: "abspann",
          message: "Alles zum Nachlesen und Weitermachen.",
        },
        note: "Falls jemand nach dem EU AI Act fragt: Er reguliert risikobasiert — es kommt nicht auf die Technik an, sondern darauf, wofür man sie einsetzt. Für unser Beispiel zwei Punkte. Transparenz: Wo ein Agent nach außen kommuniziert, muss erkennbar sein, dass eine Maschine beteiligt ist — deshalb steht das als erster Satz unter jeder Antwortmail. Nachvollziehbarkeit: Was der Agent getan hat und warum, muss dokumentiert sein — das ist die Schrittfolge unter der Antwortmail. Und: Ich bin kein Jurist; das früh ins Haus holen statt am Ende.",
        say: "Und damit Du nicht bei null anfangen musst, habe ich Dir vier Wege mitgebracht — je nachdem, wer Du bist. Wer selbst ausprobieren will, fängt links oben an: Amazon Quick kostet nichts und braucht kein AWS-Konto. Wer es erst verstehen will, hat rechts zwei kostenlose Kurse. Wer es bauen lassen will, gibt die Links links unten an seine IT weiter. Und wer es nicht allein anfangen möchte, findet rechts unten den Partner dafür. Du findest alle Infos in der E-Mail-Antwort und jetzt auch auf Deinem Handy. Vielen Dank.",
        papier: {
          /*
            Im PDF waere das die Seite vor der Schlussseite, die dieselbe Liste
            schon traegt — dort aber mit den vollstaendigen Adressen und dem
            Satz dazu, den auf einer Leinwand niemand lesen koennte.
          */
          weg: true,
        },
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
