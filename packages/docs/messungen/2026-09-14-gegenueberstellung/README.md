# Gegenüberstellung, 14.09.2026

Dieselbe Mail von Hallbach Süßwaren, fünf Ausstattungen, jede fünfmal, auf
Claude Sonnet 4.6.

Erzeugt mit

```bash
AWS_PROFILE=<dein-profil> pnpm --filter @ecr-talk/presentation gegenueberstellung
```

— in der Fassung des Skripts vom 14.09. Damals lief der Mailweg über eine
eigene Werkzeugschleife, und das Skript verglich die fünf Ausstattungen unten.
Seit dem 16.09. misst es den ausgerollten Postfach-Agenten mit und ohne
Kategorieziele; diese Tabelle lässt sich damit nicht mehr eins zu eins
erzeugen. Das Skript schreibt nach `/tmp/gegenueberstellung/` (änderbar über
`ORDNER`); die Datei, die dort `ergebnis.json` heißt, liegt hier als
`rohdaten.json`.

## Was hier liegt

| Datei | Inhalt |
|---|---|
| `messwerte.txt` | Die Tabelle: Zahlendeckung, Systemabfragen, Token, Kosten |
| `rohdaten.json` | Alle 25 Läufe als Daten — Text, Schritte, Deckung, Verbrauch |
| `<ausstattung>-<n>.txt` | Was der Agent im n-ten Lauf an Andreas Walter geschrieben hat |

## Die fünf Ausstattungen

| Kennung | Systemprompt | Werkzeuge |
|---|---|---|
| `roh` | nur „Beantworte diese E-Mail." | nein |
| `probe` | `SYSTEM_PROBE` — fordert ausdrücklich zum Raten auf | nein |
| `prompt` | `SYSTEM_ASSISTENT`, der volle Prompt | nein |
| `voll` | `SYSTEM_ASSISTENT` | ja |
| `gestoert` | `SYSTEM_ASSISTENT` | ja, Aktionskalender ausgefallen |

## Worauf man beim Lesen achten sollte

**`prompt-*.txt`** — der Agent hat den vollen Systemprompt und keine Werkzeuge.
Er fragt nicht zurück, sondern erfindet. In mehreren Läufen schreibt er einen
`<tool_call>` auf ein Werkzeug, das er nicht hat, und die `<tool_response>`
gleich dahinter. Die Marge rechnet er selbst und falsch: `1,60 / 4,49 = 35,6 %`,
in jedem der fünf Läufe.

**`voll-*.txt`** — keine einzige unbelegte Zahl. Er nennt zwei Punkte als offen,
statt sie zu überspielen.

**`gestoert-*.txt`** — der Aktionskalender antwortet nicht. In fünf von fünf
Läufen nennt der Agent **kein** Aktionsdatum und benennt die Lücke.

**Was in `voll` nach außen geht, obwohl es drinnen bleiben sollte:** Rohertrag
31,1 %, Marktpanel +14,7 %, die Belegung der Riegelzone. Der Absender ist ein
Lieferant in einer Verhandlung. Das ist kein Fehler des Codes, sondern eine
Lücke im Prompt — und der Anlass für die zweite Fassung.
