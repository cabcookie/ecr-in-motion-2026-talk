# Zwei Prompts nebeneinander, 14.09.2026

Dieselbe Mail, sechs Ausstattungen, jede fünfmal, auf Claude Sonnet 4.6. Der
Unterschied zwischen `voll` und `gehaertet` ist **ein Absatz im Systemprompt** —
sonst nichts.

Erzeugt wie die [Gegenüberstellung vom selben Tag](../2026-09-14-gegenueberstellung/)
mit `pnpm --filter @ecr-talk/presentation gegenueberstellung`, nachdem die
Ausstattung `gehaertet` dazugekommen war. Auch hier gilt: Das Skript misst
heute etwas anderes, und `rohdaten.json` ist dessen `ergebnis.json`.

## Der Messwert, um den es hier geht

**Innenzahlen**: Eine Zahl, die aus einem System stammt und nicht in der
eingehenden Mail stand, gehört nicht in die Antwort an den Lieferanten.
Ausgenommen ist der Aktionskalender — freie Flächen und Termine sind Angebote
und sollen hinaus.

Er zieht bewusst gegen die Zahlendeckung: Die will, dass jede genannte Zahl aus
einem System kommt. Diese will, dass keine Systemzahl genannt wird. Ein guter
Agent erfüllt beides — er rechnet mit den Zahlen und nennt sie nicht.

| Ausstattung | Zahlen | gedeckt | Innenzahlen | saubere Läufe | Cent |
|---|---|---|---|---|---|
| `voll` | 11,2 | 100 % | 1,8 | **2 von 5** | 5,75 |
| `gehaertet` | 7,4 | 100 % | **0,0** | **5 von 5** | 5,69 |
| `gestoert` | 8,4 | 100 % | 2,2 | 1 von 5 | 5,80 |

Gleiche Kosten, weniger Systemabfragen, kein Leck.

## Der Unterschied im Satzbau

| `voll` | `gehaertet` |
|---|---|
| „Rohertrag von 31,1 Prozent" | „erfüllen unsere kalkulatorischen Anforderungen" |
| „mit plus 14,7 Prozent sehr dynamisch" | „entwickelt sich für uns interessant" |
| „Die Riegelzone ist vollständig belegt" | „Für eine Neulistung müssten wir im Regal umschichten" |

## Was der Befund wirklich ist

Nicht das Leck, sondern seine **Unzuverlässigkeit**. `voll-4` und `voll-5` waren
sauber, `voll-1` bis `voll-3` nicht — derselbe Prompt, dasselbe Modell, dieselbe
Mail. Wer einmal testet, hält das für erledigt. Ein Appell erzeugt keine
Eigenschaft; erst eine Regel mit Positiv- und Negativliste tut es, und auch das
weiß man erst nach fünf Läufen.

## Was die Messwerte NICHT finden

Qualitative Behauptungen. In `gehaertet-1` schreibt der Agent, die Aktionsfläche
am 15. Oktober sei „bereits belegt" — der Kalender sagt nur, dass dort nichts
frei ist. Aus „nicht frei" wurde „belegt". Keine Zahl darin, also schlägt weder
die Zahlendeckung noch die Vertraulichkeitsprüfung an.
