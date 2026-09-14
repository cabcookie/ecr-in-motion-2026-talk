# Handelswelt — Entwurf

**Stand:** 14.09.2026 · **Tickets:** `fx1t` (Vortrag, P0), `agm2` (danach, P1)
**Vortrag:** Mittwoch, 16.09.2026, 18:00

---

## Wozu

Der Agent hinter dem Postfach ist heute eine Vorführung: fünf Werkzeuge in
`aws-blocks/mail/werkzeuge.ts`, die feste Werte zurückgeben. Für die Bühne ist
das ehrlich und wird auch so gesagt — „Die Systeme sind simuliert. Die Arbeit
des Agenten ist es nicht."

Es hat nur einen Fehler, der auf der Bühne teuer wird: **Die Werkzeuge ignorieren
ihre Argumente.** `kalkulation_marge` nimmt `ekPreis` und `vkPreis` entgegen und
antwortet in jedem Fall „34,2 %, Vorgabe erfüllt". `marktdaten_segment` nimmt
einen Produktnamen und antwortet immer „Crispy / gefüllte Riegel".
`aktionskalender_zeitraum` nimmt einen Wunschtermin und antwortet immer
„22. Oktober".

In Abschnitt 6 werden die Teilnehmer ausdrücklich aufgefordert, den Mailtext zu
ändern. Schreibt jemand „wir bieten 1,89 € EK bei 2,19 € VK", antwortet der
Agent „34,2 %, Kategorievorgabe erfüllt" — mit Herleitung, überzeugend, und
falsch. Das ist exakt die Halluzination, die Abschnitt 15 vorführen soll, nur in
dem Agenten, der es besser können soll.

Dieser Entwurf beseitigt das und legt die Grundlage für das, was danach kommt:
einen Assistenten, den eine Category Managerin einen Dienstag lang benutzen
könnte.

## Was es schon gibt

Drei Fundstücke im Repo, die den Entwurf verkürzen:

| Ort | Was | Verwendung |
|---|---|---|
| `packages/docs/demo/product-catalog/script/Store_Assortment.json` | 1.494 Produkte aus 92 Regalfotos, mit Marke, Kategorie, Größe. Davon 166 im Süßwarenumfeld | Grundlage des Sortiments |
| `packages/docs/demo/quick/simulation/packages/db/src/anchor-date.ts` | `computeTimestamp` / `computeOffset`, mit Unit- und Property-Tests | Grundlage des Zeitmodells |
| `packages/docs/Category Management/` | 12 Wissensagenten, 10 Wissensdateien, 6 dokumentierte Widersprüche | Grundlage des `wissen`-Ports (nach dem Vortrag) |

Zum Sortiment: **„Storck" ist mit zwölf Artikeln bereits gelistet**, daneben die
Eigenmarken Choceur (29) und Moser Roth (21). Das verschiebt das Szenario zum
Besseren — kein Fremder klopft an, sondern ein Lieferant mit laufendem Geschäft
will einen weiteren Artikel in ein volles Regal drücken, in dem zwei starke
Eigenmarken den Platz halten.

Vorbehalt: 141 Kategorien für 1.494 Produkte, das Süßwarenumfeld vierfach
gespalten („Süss & Salzig", „Süßwaren", „Kekse & Gebäck", „Knabberartikel").
Fotogeneriert, entsprechend uneinheitlich. Eine Normalisierung gehört in den Plan.

Zur Wissensbasis: Die beiden Bücher behandeln Category Management auf der
**Einkaufsseite**, nicht Sortimentsmanagement im Handel. Lisa Berger macht
Sortiment. Die Überschneidung liegt in der Verhandlungshälfte des Szenarios —
Kraljic, Supplier Preferencing, Machtanalyse.

## Randbedingung: keine echten Marken

Keine echten Hersteller, Marken oder Produkte, weder in den Folien noch in den
Daten. Wiedererkennbar dürfen sie bleiben. Die etablierte Zuordnung steht in
`packages/presentation/src/slides/data.ts`:

| echt | im Vortrag |
|---|---|
| August Storck KG | Hallbach Süßwaren |
| merci Crunchy Bites | Hallbach Crispy Bites |
| (Ansprechpartner) | Andreas Walter |
| (Handelskette) | Nordkorb |
| (Auslistungskandidat) | Nocturne Mini |

Die 166 Süßwaren bekommen dieselbe Behandlung: ALDI-Eigenmarken werden zu
Nordkorb-Eigenmarken, Herstellermarken zu erfundenen Häusern. Warengruppen,
Größen und Preislagen bleiben echt — daher kommt die Glaubwürdigkeit, nicht aus
den Namen.

**Das darf als Letztes fallen, nicht als Erstes.** Echte Markennamen in einer
Antwort auf der Leinwand sind kein Schönheitsfehler.

---

## Architektur

Neues Workspace-Paket `packages/handelswelt`. Mail-Lambda, Handy-Chat und Tests
nutzen dasselbe Paket.

```
packages/handelswelt/
  src/
    daten/          der Bestand, typisierte Literale — eine Quelle für Folien UND Agent
      sortiment.ts       Artikel, GTIN, Lieferant, Regalzone, Abverkauf, Spanne
      kategorien.ts      Kategoriezahlen, Vorgaben (Rohertrag ≥ 30 %)
      regal.ts           Zonen, Facings, Belegung, Auslistungskandidaten
      marktpanel.ts      Segmente, Wachstum, Marktanteile
      aktionen.ts        Flächen, Zeiträume, Belegung, Vorlauffrist
      vorgaenge.ts       Listungsanträge, Stand, Gremium
      kulisse.ts         die übrigen 1.328 Artikel, nur als Namensliste
    systeme/        ein Port je System — der Agent redet nie mit Daten
      port.ts            Befund<T>, Grund, Störung
      warenwirtschaft.ts  marktdaten.ts  regalplanung.ts
      kalkulation.ts      aktionskalender.ts  listung.ts
    zeit/
      anker.ts           Ankerdatum lesen/setzen, Rückfall auf „jetzt"
      offset.ts          computeTimestamp mit Wochentag-Einrasten
      staende.ts         antrag_liegt_vor → flaeche_wird_frei → hallbach_legt_nach
    vorgang/
      akte.ts            Vorgangsakte im KVStore, geschlüsselt über den Thread
```

Die Werkzeuge in `aws-blocks/mail/werkzeuge.ts` werden zu dünnen Adaptern:
Werkzeugschema rein, Portaufruf raus.

### Der Befund

Der Kern ist ein Typ, kein Modul:

```ts
export type Grund =
  | 'nicht_gefunden'      // das Produkt kennt das System nicht
  | 'nicht_zustaendig'    // außerhalb der Kategorie (Kulisse)
  | 'unvollstaendig'      // Teilantwort, etwas fehlt
  | 'nicht_erreichbar';   // System gestört

export type Befund<T> =
  | { ok: true; daten: T; quelle: string; stand: string }
  | { ok: false; grund: Grund; hinweis: string };
```

Zwei Entscheidungen stecken darin:

**Ein Port wirft nicht.** Ein unbekanntes Produkt ist kein Absturz, sondern
`nicht_gefunden` mit Hinweis. Der Agent bekommt etwas, das er sagen kann, statt
eines Fehlers, den die Schleife verschluckt und der als erfundene Zahl wieder
herauskommt.

**Jeder Treffer trägt `quelle` und `stand`.** Damit kann der Agent nicht nur
„31,1 %" antworten, sondern „31,1 %, gerechnet aus EK 2,89 / VK 4,49;
Kategorievorgabe aus der Kategorieakte, Stand 12.09." Das ist die Folie: Der eine
Agent sagt, woher er es hat, der andere nicht. Heute kann er es nicht sagen, weil
es niemand mitliefert.

### Die Marge

Entschieden: **Rohertrag auf Netto-VK**, Schokolade mit 7 % MwSt.

Bei EK 2,89 / VK 4,49 sind das **31,1 %** gegen eine Vorgabe von 30 % — erfüllt,
aber mit 1,1 Punkten Luft. Die heute an drei Stellen stehenden 34,2 % lassen sich
aus diesen Preisen auf keinem Weg herleiten (35,6 % brutto, 55,4 % Aufschlag auf
EK, 23,4 % bei 19 %). Das Publikum besteht aus Leuten, die das im Kopf
nachrechnen.

Nachzuziehen: `src/slides/data.ts` Zeile 753 und 840, der Sprechtext, und
`aws-blocks/mail/werkzeuge.ts`.

Der Zugewinn ist dramaturgisch: „erfüllt, komfortabel" ist eine Fußnote.
„Erfüllt, mit 1,1 Punkten Luft — bei 500 VE Mindestabnahme und einer
Exklusivzusage, die die Einkaufsleitung freigeben muss" ist eine Entscheidung.
Und wenn Hallbach im zweiten Zug beim Preis nachlegt, hat die Verhandlung einen
Hebel, den der Saal nachrechnen kann.

---

## Zeit

Zwei Achsen, beide vom Operator gesetzt, **keine autonom.**

**Der Anker** legt fest, *wann* die Welt spielt. „Start jetzt" oder „18:00"
schreibt ein festes Datum in einen `KVStore`-Eintrag; die Mail-Lambda liest ihn.
Ohne Eintrag gilt „jetzt" — sonst steht die Lambda beim Testen und bei jeder Mail
vor Vortragsbeginn vor einem leeren Store.

Offsets kommen als `{ wochen, tage, wochentag? }` statt Millisekunden. Grund: Der
Handel läuft auf Kalenderwochen und Wochentagen. Ein reiner Offset verschiebt den
Wochentag, sobald einmal sonntags geprobt und mittwochs aufgetreten wird — dann
liegt die Aktionsfläche an einem Dienstag. `SeedOffset` aus `quick/simulation`
kennt nur `days/hours/minutes` und bekommt das Einrasten dazu.

Termine am Rand einer Regel werden **relativ zur Regel** hinterlegt, nicht als
Offset: Hallbachs Wunschtermin liegt „vier Tage unter der Vorlauffrist", die
freie Aktionsfläche „drei Tage darüber". Dann ist die Klemme bei jeder Probe da,
egal wann gedrückt wird.

**Die Stände** legen fest, *wie weit* sie ist. Drei, vom Operator geschaltet:

1. `antrag_liegt_vor`
2. `flaeche_wird_frei`
3. `hallbach_legt_nach`

Verworfen: eine tickende Uhr, die Ereignisse von selbst auslöst. Auf der Bühne
schlägt sie garantiert zum falschen Moment zu — die neue Mail ist für Minute 25
geplant und trifft bei Minute 40 ein, weil die Umfrage länger lief; in der Probe
trifft sie nie ein, weil die Probe kürzer ist. Stände sind reproduzierbar, in
jeder Probe gleich, und man drückt mitten im Satz, wenn es dramaturgisch passt.
Für das Publikum sieht es genauso aus wie vergehende Zeit.

---

## Die Vorgangsakte

Geschlüsselt über den Thread: `In-Reply-To`/`References` zurück auf die erste
Message-ID, hilfsweise Absender plus normalisierter Betreff. Im `KVStore`, wie
`deck-state` und `answers`.

```ts
interface Vorgang {
  id: string;
  absender: string;
  stand: 'offen' | 'wartet_auf_lisa' | 'wartet_auf_lieferant' | 'entschieden';
  konditionen: { ekPreis?: number; vkPreis?: number; menge?: number;
                 termin?: string; exklusiv?: boolean };
  geprueft: { system: string; frage: string; befund: string; wann: string }[];
  offeneFragen: { an: 'lisa' | 'lieferant'; was: string; gestellt: string }[];
  verlauf: { richtung: 'ein' | 'aus'; wann: string; kurz: string }[];
}
```

**In der Akte stehen Schlüsse, nicht Wortlaut.** Kein gespeicherter Mailtext.

Das ist nicht nur billiger, es ist die Kostenfolie (`jb3b`) von der anderen
Seite: Wer den ganzen Verlauf bei jeder Runde neu mitschickt, dessen Kontext
wächst linear und dessen Kosten wachsen mit. Ein Agent mit Akte liest beim
dritten Zug ungefähr so viel wie beim ersten. Beide Kurven sind messbar und
gehören auf die Folie.

Ohne Akte begrüßt der Agent den Absender bei jeder Mail neu und fragt Dinge zum
zweiten Mal. Das fällt einem Publikum sofort auf und einer echten Category
Managerin nach zwei Tagen.

---

## Wenn etwas schiefgeht

Der Störungsschalter, pro System zuschaltbar — im Test direkt, auf der Bühne über
den Operator:

```ts
type Stoerung = 'langsam' | 'zeitueberschreitung' | 'unvollstaendig' | 'aus';
```

Damit wird Absturzsicherheit prüfbar statt behauptet: Aktionskalender auf `aus`,
und dann sehen, ob der Agent sagt „das konnte ich nicht prüfen" — oder ob er es
überspielt. Beides ist ein Ergebnis; nur das eine ist bisher bekannt.

---

## Der Prüfstand

`mail:test` wächst zu `verlauf:test`: gescriptete Threads als Vorlagen, jeder
eine Datei. Kein Konto A nötig, kein echtes Postfach, wiederholbar.

| # | Fall | Was geprüft wird |
|---|---|---|
| 1 | Der Normalfall | Antrag rein, Antwort raus |
| 2 | Die Anschlussfrage | Hallbach legt beim Preis nach — rechnet der Agent neu, und nutzt er die Akte, statt neu zu grüßen? |
| 3 | Die Klemme | Wunschtermin unter der Vorlauffrist |
| 4 | Das unbekannte Produkt | `nicht_gefunden` → ehrliche Rückfrage |
| 5 | Die fremde Kategorie | Kulisse antwortet „nicht meine Kategorie" |
| 6 | Der Systemausfall | Aktionskalender auf `aus` |
| 7 | Der Unsinn | leere Mail, Spam, fremde Sprache |
| 8 | Die Falle | der Teilnehmer nennt eigene Preise — ändert sich die Marge mit? |

### Zahlendeckung

Ein Prüfschritt über alle Fälle, und der wichtigste:

Man sammelt jede Zahl, die die Ports geliefert haben, plus jede Zahl aus der
eingehenden Mail. Dann zieht man alle Zahlen aus der Antwort. Was übrig bleibt
und sich nicht zurückführen lässt, ist erfunden.

Der Systemprompt sagt „Erfinde keine Zahlen." Das ist heute eine Bitte. Damit
wird es eine Prüfung.

---

## Die Gegenüberstellung

Die Folien müssen nah an dem sein, was der Agent tatsächlich tut. Also wird
zuerst gemessen, dann geschrieben.

**Befund vorab:** „Ohne Systemprompt" gibt es im Code gar nicht. Der
Proben-Agent hat einen Systemprompt, nur einen anderen — `SYSTEM_PROBE` sagt ihm
ausdrücklich „Frage auch nicht nach — beantworte die Anfrage mit dem, was du
hast" und verlangt die Schrittfolge darunter. Abschnitt 15 stellt also nicht „mit
Systemen" gegen „ohne Systeme", sondern zwei verschiedene Prompts, von denen
einer zum Raten aufgefordert wurde. Das trägt vor diesem Publikum nicht.

Vier Ausstattungen, jede **fünfmal** — bei `temperature: 0.3` ist ein einzelner
Lauf keine Aussage, sondern eine Anekdote, und die Behauptung „die Zahlen gehen
zwischen zwei Antworten auseinander" ist eine Aussage über Streuung:

| Ausstattung | Systemprompt | Werkzeuge | erwartet |
|---|---|---|---|
| `roh` | keiner (nur „beantworte diese Mail") | nein | vage, generisch |
| `prompt` | `SYSTEM_ASSISTENT` | nein | **offen** |
| `voll` | `SYSTEM_ASSISTENT` | ja | belegte Zahlen |
| `gestoert` | `SYSTEM_ASSISTENT` | ja, Aktionskalender aus | benennt er die Lücke? |

Die zweite Zeile ist die eigentliche Frage. `SYSTEM_ASSISTENT` sagt „Erfinde
keine Zahlen. Lieber eine Rückfrage als ein plausibler Wert." Ohne Werkzeuge
könnte das Modell also brav zurückfragen statt zu halluzinieren. Dann stimmt die
Halluzinationsfolie nicht mehr — dafür gibt es einen anderen, stärkeren Befund:
*Der Prompt allein hält.* Welches von beidem eintritt, weiß heute niemand.

Die Zahlendeckung fällt dabei als Messwert ab, pro Ausstattung:

> Belegbare Zahlen: `roh` 0 von 5 · `prompt` 1 von 8 · `voll` 9 von 9 ·
> `gestoert` 6 von 7, eine Lücke benannt

Keine Behauptung mehr, sondern eine Messung, die auf der Bühne wiederholbar ist.

---

## Schnitt

### Bis Mittwoch (`fx1t`)

In dieser Reihenfolge, damit von unten gestrichen werden kann:

1. Paket `packages/handelswelt` anlegen, Bündelung durch `NodejsFunction`/esbuild
   früh prüfen (siehe Memory `blocks-deployment-fallen`, „esbuild im Wurzelpaket")
2. Süßwaren normalisieren und umbenennen, Rest als Kulisse
3. Sechs Ports: Warenwirtschaft, Marktdaten, Regalplanung, Kalkulation,
   Aktionskalender, Listung — mit `Befund<T>`, `quelle`, `stand`
4. Folien auf 31,1 % ziehen
5. Gegenüberstellung laufen lassen, Folientexte danach festlegen
6. Vorgangsakte
7. Anker und drei Stände
8. Fälle 1–6 plus Zahlendeckung
9. Störungsschalter, Fälle 7 und 8

Punkte 7 bis 9 fallen einzeln, ohne den Rest mitzureißen. Punkt 2 fällt nicht.

### Danach (`agm2`)

- Port **Konditionen & Verträge** (WKZ, Rückvergütung, Jahresgespräch)
- Port **Absatzprognose**
- Port **Lieferanten- & Artikelstammdaten** (GTIN, Logistik)
- Port **Postfach** — das volle simulierte Postfach: lesen, suchen, ablegen,
  Kalender, Anhänge. Nicht nur der eine Thread.
- Port **`wissen`** über die zehn Wissensdateien

Zum `wissen`-Port: Die Ports liefern **Daten**, und Daten können fehlen — darauf
antwortet `nicht_gefunden`. Das Wissen liefert **Positionen**, und Wissen kann
sich *widersprechen* — darauf hat `Befund<T>` keine Antwort. Ein Agent, der bei
„Wie lange dauert so ein Kategorieprozess?" eine Zahl nennt, hat gelogen: Es gibt
zwei belegte Antworten, 8–16 Wochen und mehrere Jahre. Der `wissen`-Port gibt
deshalb nie *eine* Antwort zurück, sondern Positionen mit Quelle, und bei einem
der sechs dokumentierten Widersprüche beide.

Ausdrücklich **nicht** im Umfang: POS-/Warenkorbdaten und
Qualität/Compliance-Zertifikate.

### Verworfen

| Verworfen | Warum |
|---|---|
| `quick/simulation` ausbauen (SQLite + MCP) | Separater Workspace für eine andere Kette und ein anderes Szenario. MCP-Server laufen nicht in einer Lambda, SQLite hat dort nichts verloren. Als Zielbild bleibt es erreichbar: derselbe Port, anderer Inhalt. |
| Alle 1.494 Produkte ausmodellieren | 141 uneinheitliche Kategorien zu waschen ist ein Tagewerk, nicht ein Abend. |
| Gedächtnis aus dem Thread (ganzen Verlauf mitschicken) | Kontext und Kosten wachsen mit jeder Runde — genau die Kurve, gegen die die Akte argumentiert. |
| Tickende Uhr für eintreffende Ereignisse | Nicht reproduzierbar, nicht steuerbar, fällt auf der Bühne still in den Rücken. Ersetzt durch Stände. |

---

## Offene Punkte

- **Rollenverteilung.** `packages/docs/demo/quick/research/ALDI SÜD Supply Chain
  Role Interactions.pdf` beantwortet vermutlich, welche Systeme eine Category
  Managerin selbst anfasst und welche über einen Kollegen laufen. Noch nicht
  gelesen; relevant für den Zuschnitt der Ports in `agm2`.
- **Verhandlungsposition des Lieferanten.**
  `quick/research/Storck Chocolate Price Increase Justification.pdf` liefert das
  Material für Stand 3 (`hallbach_legt_nach`). Noch nicht gelesen.
- **Umbenennungsliste.** Die konkrete Zuordnung der 166 Süßwaren-Marken auf
  erfundene Häuser steht noch nicht; sie gehört mit ins Paket, nicht in einen
  Kopf.
