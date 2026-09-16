# Unterlagen zum Vortrag

Zwei Dinge liegen hier, und beide sind Erzeugnisse des Vortrags — nicht seine
Quelle. Die Quelle der Wahrheit ist `packages/presentation/src/slides/data.ts`.

## `storyboard/`

Der ganze Vortrag auf einer Seite: jede Folie mit ihrem Sprechertext, zum
Durchsehen ohne Browser-Klickerei.

```
pnpm --filter @ecr-talk/docs storyboard
```

Das Skript liest `data.ts` und setzt daraus `storyboard.html`. Wer den Text
einer Folie ändern will, ändert ihn dort und baut neu — eine Änderung direkt
in der HTML-Datei ist beim nächsten Lauf wieder weg.

## `messungen/`

Was der Agent in echten Läufen gegen Bedrock tatsächlich geantwortet hat —
Prompt, Rohantwort und Auswertung, je Lauf eine Datei. Das ist der Grund,
warum die Zahlen auf den Folien nachprüfbar sind statt behauptet: Jede von
ihnen lässt sich bis auf eine dieser Dateien zurückführen.

Sie werden nicht neu erzeugt, wenn jemand das Repo baut. Ein Messlauf kostet
Geld und liefert andere Zahlen; was hier liegt, ist der Stand, auf den sich
der Vortrag beruft.

Jeder Messordner nennt den Befehl, der ihn erzeugt hat. Die drei hier
entstanden mit früheren Fassungen von `scripts/gegenueberstellung.ts`; was das
Skript heute misst, steht in seinem Kopfkommentar.

Ein Wort, das hier anders gemeint ist als im übrigen Repo: `probe` ist in
diesen Messungen eine **Ausstattung** — ein Agent ohne Werkzeuge, der zum
Raten aufgefordert wird. Mit den Proben des Vortrags (`src/probe/`) hat das
nichts zu tun.
