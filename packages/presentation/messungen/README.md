# Messungen zu den Szenarien und den Kategoriezielen

Zwei Messungen vom 15.09.2026, beide auf Claude Opus 4.8 gegen echtes
Bedrock. Die Messungen zu Prompt und Modellwechsel liegen in
`packages/docs/messungen`.

Beide Ordner entstanden, als der Mailweg noch eine eigene Werkzeugschleife
hatte. Seit dem 16.09. beantwortet der Blocks-Agent aus `aws-blocks/agent`
die Mails, und die Befehle unten fahren genau diesen Agenten. Sie bilden
denselben Aufbau nach, die Antworten werden aber nicht Wort für Wort gleich
ausfallen. Ein neuer Lauf **überschreibt** den Ordner und kostet echtes Geld.

## `szenarien/`

Die vierzehn Mails, die das Publikum im Vortrag an den Agenten schicken kann
(`src/slides/briefing.ts`), je einmal. Gemessen wird nicht die einzelne
Antwort, sondern ihre Verteilung: Wie viele Zusagen, wie viele Absagen, und
fragt der Agent in jedem Lauf die Kategorieziele ab?

```bash
AWS_PROFILE=<dein-profil> pnpm --filter @ecr-talk/presentation szenarien
```

Je Szenario eine Textdatei (Typ, befragte Systeme, die Antwort, wie sie
hinausginge) und alles zusammen in `ergebnis.json`.

Namen, Firmen und Marken sind erfunden. Die Absender haben die Endung
`.example`, die für Beispiele reserviert ist und niemandem gehört. Beim
Messlauf stand dort noch `.de`, und eine Antwort nannte eine solche Adresse.
Sie ist nachträglich ersetzt.

## `ziele-gegentest/`

Die Messung hinter der Folie „Sechs Werkzeuge / Sieben Werkzeuge": dieselbe
Mail (Morgenrot, eine Preiseinstiegstafel), dasselbe Modell, derselbe
Systemprompt, dreimal mit und dreimal ohne das Werkzeug `kategorie_ziele`.

```bash
AWS_PROFILE=<dein-profil> pnpm --filter @ecr-talk/presentation ziele:gegentest
```

Die Dateien hier entstanden mit einer früheren Fassung der Gegenüberstellung,
bevor es dieses Skript gab.

Ausgewertet wurde durch Lesen, nicht automatisch: Ein Klassifikator per
Regex hielt zwei eindeutige Absagen für unklar bzw. für ein Ja. Das Ergebnis:
Ohne Ziele entscheidet der Agent in keinem der drei Läufe, mit Zielen sagt er
dreimal ab. Die Belege stehen in den sechs Dateien selbst.
