# Dieselbe Messung auf Opus 4.8, 15.09.2026

Modellwechsel von Sonnet 4.6 auf Opus 4.8. Sonst unverändert — gleiche Mail,
gleiche sechs Ausstattungen, je fünf Läufe.

## Was der Wechsel zuerst kostete

**Alle 30 Läufe scheiterten.** `` `temperature` is deprecated for this model. ``
Opus nimmt den Parameter nicht an, den `agent.ts` seit jeher mitschickte — und
zwar bei jedem Aufruf, nicht bei manchen.

`mail:test` blieb dabei grün, weil er gegen eine Attrappe läuft. Aufgefallen
wäre es erst am Vortragsabend, bei der ersten Teilnehmer-Mail. Seitdem gibt es
`modell:test`: ein einziger echter Aufruf mit genau der Konfiguration des
Agenten, für weniger als einen Zehntelcent.

## Die Zahlen

| Ausstattung | Zahlen | gedeckt | Innenzahlen | saubere Läufe | Token | Cent |
|---|---|---|---|---|---|---|
| `roh` | 6,4 | 87 % | 0,0 | 5/5 | 884 | 1,75 |
| `probe` | 7,2 | 83 % | 0,0 | 5/5 | 1.478 | 2,85 |
| `prompt` | 14,4 | **57 %** | 0,0 | 5/5 | 2.555 | 4,28 |
| `voll` | 8,0 | **100 %** | **0,0** | **5/5** | 15.143 | 11,52 |
| `gehaertet` | 6,4 | **100 %** | **0,0** | **5/5** | 16.820 | 12,12 |
| `gestoert` | 6,8 | 100 % | 0,4 | 4/5 | 15.039 | 11,79 |

## Was das gegenüber Sonnet bedeutet

**Der Unterschied zwischen den beiden Prompts ist verschwunden.** Auf Sonnet gab
`voll` in 3 von 5 Läufen Interna preis, `gehaertet` in keinem. Auf Opus sind
beide sauber. Opus hält die Vertraulichkeit schon mit dem allgemeinen Hinweis im
ursprünglichen Prompt.

Für die Block-4-Folie heißt das: Die gemessene Aussage „ein Absatz im Prompt
macht aus 2 von 5 fünf von fünf" gilt **für Sonnet 4.6**, nicht für Opus 4.8.
Wer sie zeigt, muss das Modell dazusagen — sonst ist sie falsch.

Die eigentliche Lehre bleibt, und sie wird sogar größer: Dieselbe Regel, dasselbe
Prompt, ein anderes Modell — und das Ergebnis kippt. Wer einmal misst und dann
das Modell wechselt, weiß wieder nichts.

**Halluzination bleibt, ist aber milder:** `prompt` ohne Werkzeuge deckt 57 %
statt 42 %. Die falsche Margenrechnung (35,6 %) steht weiterhin drin.

**Kosten etwa doppelt:** 11 bis 12 Cent je Lauf statt 5,7.
