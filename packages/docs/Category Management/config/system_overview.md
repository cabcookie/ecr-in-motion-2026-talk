# System Overview

Übersicht: welcher Agent, welches Wissen, welche Newsletter.

## Grundlage

| Kürzel | Werk | Status |
|---|---|---|
| **CMH** | Cordell, Andrea & Thompson, Ian: *The Category Management Handbook*, Routledge 2018. ASIN B0GFNZ2QCL | Vollständig erfasst, **39.595 Wörter**, 185 Seiten |
| **OBrien** | O'Brien, Jonathan: *Category Management in Purchasing*, 5. Auflage, Kogan Page 2024. ASIN B0CTKS37ST | Vollständig erfasst, **192.911 Wörter**, 548 Seiten |

**Quellenkürzel in allen Wissensdateien**: `[Quelle: CMH, Act N]` für eine der 33 Aktivitäten, `[Quelle: CMH, Stage N]` für Stufentexte, `[Quelle: CMH, Intro]`, und `[Quelle: OBrien, Kap N]`. Die Legende steht im Kopf **jeder** Wissensdatei.

**Der Charakter der Quelle bestimmt den Charakter der Aussage und ist in Antworten mitzunennen:**
- **CMH** ist ein werkzeugorientiertes Praktikerhandbuch mit **ausdrücklich beraterkritischer Haltung**. Es stellt jedes der 33 Werkzeuge im gleichen Raster dar (Overview, Elements, So what?, Category management application, **Limitations**, Template) und der Limitations-Abschnitt ist "an open and even-handed critique". **CMH ist die bessere Quelle für die Grenzen eines Werkzeugs.**
- **OBrien** ist ein Rahmenwerk eines praktizierenden Beraters mit eigenen eingetragenen Marken (**5i®, Orchestra of SRM®, Red Sheet®, OMEIA®**), einem eigenen Softwareprodukt (Capella Guided Category Strategy Creator®, offengelegt) und Verweisen auf drei eigene Schwesterbücher, ohne die das Werkzeugbild unvollständig bleibt. **OBrien ist die bessere Quelle für Operationalisierung, gerechnete Beispiele und aktuelle Kontextfragen, trägt aber eine Interessenlage.**

## Erfassungsmethode

Beide Titel liefern im Kindle Cloud Reader **keinen DOM-Text**; jede Seite wird als Blob-Bild gerendert (`bildRendering: true`, `textLaenge: 0`). Erfassung über Seiten-Screenshots mit anschließender OCR per tesseract.

| Punkt | CMH | OBrien |
|---|---|---|
| Positionen / Seiten | 2800 Positionen, 190 Kindle-Seiten | 12494 Positionen, 550 Kindle-Seiten |
| Screenshots | **185** | **548** (538 Hauptlauf plus 10 nachgefasste Anfangsseiten) |
| Viewport | **1300 × 1750**, Seitenbild 780 × 1600 | identisch |
| Rate | etwa 1,03 Kindle-Seiten je Screenshot | etwa 1,0 |
| Verifikation Seitenzahl | 185 Screenshots gegen 185 Formfeed-Seiten | 548 gegen 548 |
| Kontinuitätsprüfung | 4 Seitengrenzen, nahtlos | 5 Seitengrenzen, nahtlos, **einschließlich der Naht zwischen den OCR-Teilläufen (S400/S401)** |
| Seiten unter 40 Wörtern | 33 von 185 (Templates-Anhang) | 21 von 548 |

**Erfassungsbefunde, die für eine Wiederholung festzuhalten sind:**

| Punkt | Befund |
|---|---|
| **Session** | Playwright-Session war bereits authentifiziert, kein Login nötig. Erst prüfen, dann fragen. |
| **Viewport** | 1300 × 1750 lieferte bei **beiden** Titeln nahezu fehlerfreie OCR (Testseiten: 354 und 494 Wörter zusammenhängender Text). Der Wert ist damit nicht universell, aber für Routledge- und Kogan-Page-Titel dieses Formats belastbar. **Trotzdem an einer Testseite verifizieren, nicht annehmen.** |
| **Fokus-Klick neutralisiert Rückwärtsnavigation** | Der Fokus-Klick bei `(vp.width − 30, vp.height / 2)` trifft die `pagination-container` und blättert **vorwärts**. In Kombination mit `ArrowLeft` heben sich beide auf, sodass das Zurückblättern zum Buchanfang scheinbar wirkungslos bleibt. **Folge: Beide Bücher wurden nicht am absoluten Anfang begonnen** (CMH ab Seite xv, also ab Introduction; OBrien ab Seite 12). Bei CMH unschädlich, weil nur Titelei und Inhaltsverzeichnis fehlen; bei OBrien wurden die Seiten 1 bis 10 nachgefasst. |
| **Zurückblättern, das funktioniert** | Klick am **linken** Rand `(30, vp.height / 2)`. Etwa 0,8 Seiten je Klick, also für weite Sprünge zu langsam. |
| **Navigation zum Buchanfang** | Über das Reader-Inhaltsverzeichnis (`top_menu_table_of_contents`), dann den TOC-Eintrag anklicken, dann **Escape**, dann über den Button **"Nächste Seite"** blättern. |
| **TOC-Overlay verunreinigt Screenshots** | Ein erster Nachfassversuch lieferte 24 Duplikate, weil das Overlay offen blieb und der Reader hing. Die Blob-URL änderte sich dabei trotzdem, sodass die Ende-Erkennung nicht griff. **Overlay per Escape schließen und den Inhalt per OCR gegenprüfen, nicht der Blob-URL vertrauen.** |
| **tesseract und /tmp** | **tesseract scheitert an absoluten Pfaden unter `/tmp`**, weil `/tmp` auf macOS ein Symlink auf `/private/tmp` ist. Fehlerbild: "Error in fopenReadStream ... failed to open locally". **Lösung: relative Dateilisten aus dem Bildverzeichnis heraus.** |
| **OCR in Teilläufen** | Bei OBrien in zwei Teilen (400 plus 138 Seiten), zusammengefügt **mit explizitem Form-Feed**, sonst weicht die Seitenzahl um eins ab. |
| **Kapitelstrukturerkennung** | Bei CMH stimmten zwei unabhängige Verfahren überein (Stage-Zeilen und Activity-Überschriften). Bei OBrien stimmten **drei** Quellen überein: Kapitelnummer-Titel-Zeilen im OCR-Text (8 von 10 Kapiteln), TOC-Ankerbegriffe der ersten Unterabschnitte (ergänzte Kapitel 7 und 10), und das **direkt aus der Reader-Navigation ausgelesene Inhaltsverzeichnis mit 210 Einträgen**. Keine Interpolation nötig. |

**Arbeitskopien der Volltexte außerhalb des Vaults**: `~/.aria-book-cache/cmh-fulltext.txt` und `~/.aria-book-cache/obrien-fulltext.txt`. Kapitelkarten und Zwischennotizen lagen während der Erfassung unter `/tmp/cm-a/` und `/tmp/cm-b/`.

**OCR-Einschränkung**: Die **Zellinhalte des Category Strategy Cube** (CMH, Figure 4.3) sind in der Vorlage rotiert gesetzt und waren nicht verwertbar erfassbar. Nur Dimensionen und Wertmerkmale sind aus dem Begleittext belegt. Das ist in `strategieentwicklung-und-optionsbewertung.md` vermerkt. **Formeln enthalten beide Bücher kaum**, sodass die bei mathematischen Lehrbüchern nötige Formelrekonstruktion hier nicht anfiel.

## Die zehn Themengebiete und ihre Spezialisten

**Der Schnitt folgt Funktionen im Kategoriemanagement, nicht der Kapitelfolge eines Buches.** Wo beide Bücher dasselbe Thema auf zwei Ebenen behandeln, steht es in einer Datei mit beiden Positionen.

| # | Themengebiet | Wissensdatei | Spezialist | CMH | OBrien |
|---|---|---|---|---|---|
| 1 | Grundlagen, Abgrenzung und Nutzenversprechen | `grundlagen-und-abgrenzung.md` | `specialist_grundlagen` | Introduction, Stage 1 | 1, 2, 10 |
| 2 | Kategoriesegmentierung und Chancenanalyse | `kategoriesegmentierung-und-chancenanalyse.md` | `specialist_segmentierung` | Act 2, Stage 2 | 1, 3, 4 |
| 3 | Prozessarchitektur und Gateways | `prozessarchitektur-und-gateways.md` | `specialist_prozess` | Intro, alle Gateways | 3 |
| 4 | Governance, Team und Rollen | `governance-team-und-rollen.md` | `specialist_governance` | Act 1, 3, 4, 5, 6, 7 | 2, 4, 9 |
| 5 | Anforderungen und Bedarfsermittlung | `anforderungen-und-bedarfsermittlung.md` | `specialist_anforderungen` | Act 8, 13, Stage 2 | 4, 5, 8 |
| 6 | Datenerhebung, Kostenanalyse und Marktverständnis | `datenerhebung-kostenanalyse-und-marktverstaendnis.md` | `specialist_daten` | Act 9–11, 14–18, Stage 2, 3 | 5 |
| 7 | Portfolio- und Machtanalyse | `portfolio-und-machtanalyse.md` | `specialist_portfolio` | Act 12, 19, 20, 21, 23, Stage 3 | 4, 6, 8 |
| 8 | Strategieentwicklung und Optionsbewertung | `strategieentwicklung-und-optionsbewertung.md` | `specialist_strategie` | Act 22, 24, 25, 26, Stage 4 | 4, 6 |
| 9 | Umsetzung, Veränderung und Verhandlung | `umsetzung-veraenderung-und-verhandlung.md` | `specialist_umsetzung` | Act 27, 28, 29, Stage 5 | 7 |
| 10 | Nutzenrealisierung, Lieferantenmanagement und laufende Verbesserung | `nutzenrealisierung-und-laufende-verbesserung.md` | `specialist_nutzenrealisierung` | Act 30–33 | 8, 9 |

### Bewusste Entscheidungen beim Themenschnitt
- **Öffentlicher Sektor und Handel** sind Abschnitte in Gebiet 1 und 2, **kein eigenes Themengebiet**, weil sie Anwendungskontexte und keine Funktionen sind. Ein eigener Spezialist hätte zu wenig eigenständige Methodik.
- **Digitalisierung und KI** sind in Gebiet 1 (Trajektorie, sieben Evolutionsstufen) und Gebiet 6 (Datenanforderungen) verteilt, weil sie die Anwendungsform aller Themen betreffen.
- **Nachhaltigkeit ist bewusst quer verteilt** über die Gebiete 5, 6, 8 und 10, weil OBrien sie selbst als "vein through all methodologies" führt. **Ein eigener Spezialist hätte die Verzahnung zerschnitten.**
- **Verhandlung** ist kein eigenes Gebiet, weil OBrien sie ausdrücklich in ein Schwesterbuch auslagert und CMH sie nur streift. Die zehn Tipps stehen in Gebiet 9 mit Vermerk der Abdeckungslücke.

### Vollständigkeit der Abdeckung
**CMH: alle 33 Aktivitäten und alle fünf Stufen sind zugeordnet.**
| Stufe | Aktivitäten | Hauptsächlich in |
|---|---|---|
| Introduction | – | `grundlagen-und-abgrenzung` |
| 1 Initiation | 1 Project charter, 3 Team charter, 4 RACI, 5 Stakeholder mgmt, 6 Communication plan, 7 Risk register | `governance-team-und-rollen` |
| | 2 Category hierarchy | `kategoriesegmentierung-und-chancenanalyse` |
| 2 Research | 8 RAQSCI, 13 STP | `anforderungen-und-bedarfsermittlung` |
| | 9 Category profile, 10 Data gathering, 11 Key supplier profile, 14 PPCA | `datenerhebung-kostenanalyse-und-marktverstaendnis` |
| | 12 Day one analysis | `portfolio-und-machtanalyse` |
| 3 Analysis | 15 SWOT, 16 STEEPLE, 17 Porter, 18 Supply and value-chain | `datenerhebung-kostenanalyse-und-marktverstaendnis` |
| | 19 Kraljic, 20 Supplier preferencing | `portfolio-und-machtanalyse` |
| 4 Strategy | 21 Dutch windmill, 23 Power/dependency | `portfolio-und-machtanalyse` |
| | 22 Sourcing strategy wheel, 24 Opportunity analysis, 25 Option appraisal, 26 Category plan | `strategieentwicklung-und-optionsbewertung` |
| 5 Implementation | 27 Action planning, 28 Implementing change, 29 Project management | `umsetzung-veraenderung-und-verhandlung` |
| | 30 Benefits realisation, 31 Continuous improvement, 32 Supplier management, 33 Post-Project review | `nutzenrealisierung-und-laufende-verbesserung` |

**OBrien: alle 10 Kapitel sind erfasst und zugeordnet.**
| Kapitel | Titel | Hauptsächlich in |
|---|---|---|
| 1 | Introducing category management | `grundlagen-und-abgrenzung`, `kategoriesegmentierung` |
| 2 | The principles of category management | `grundlagen-und-abgrenzung`, `governance-team-und-rollen` |
| 3 | Laying the groundwork for success | `prozessarchitektur-und-gateways`, `kategoriesegmentierung` |
| 4 | Stage 1: Initiation | `governance-team-und-rollen`, `anforderungen`, `strategieentwicklung` (Value Levers) |
| 5 | Stage 2: Insight | `datenerhebung-kostenanalyse-und-marktverstaendnis` |
| 6 | Stage 3: Innovation | `portfolio-und-machtanalyse`, `strategieentwicklung-und-optionsbewertung` |
| 7 | Stage 4: Implementation | `umsetzung-veraenderung-und-verhandlung` |
| 8 | Stage 5: Improvement | `nutzenrealisierung-und-laufende-verbesserung`, `portfolio` |
| 9 | Making category management happen | `governance-team-und-rollen`, `nutzenrealisierung` |
| 10 | Making it a success | `grundlagen-und-abgrenzung`, `governance-team-und-rollen` |

## Widerspruchsregister

**Die beiden Bücher widersprechen sich an sechs Stellen, und CMH widerspricht sich an einer Stelle selbst. Diese Widersprüche werden bewusst dokumentiert und NICHT harmonisiert. Der Orchestrator hat die Regel, bei diesen Themen beide Positionen samt Belegen darzulegen.**

**Prüfstein für die Ehrlichkeit der Darstellung: Lässt sich aus der Wissensdatei heraus die jeweils andere Position vertreten?**

| Nr | Thema | CMH | OBrien | Dokumentiert in |
|---|---|---|---|---|
| 1 | **Welche Einsparung ist erwartbar?** | "if cost reduction was the only measure, then a stretching target of **at least 20%–25%** might be considered" (Stage 1). Als **Zielsetzung** formuliert, um Breakthrough-Denken zu erzwingen | Erfahrungsspanne **10–20%**; eigene globale Umfrage (Positive Purchasing 2018): **10–14% am häufigsten**, Verteilung **polarisiert**, viele Organisationen bei wenigen Prozent; Einzelfälle 1% bis 98%. Gestützt auf Bain (Faktor 1,5 bei Reife), McKinsey (mehr als doppelt), KPMG 2012. Dazu eine Schätzmatrix von 1% bis 20% nach Preisflexibilität und Kategoriereife, **die er selbst als nicht empirisch kennzeichnet** | `grundlagen-und-abgrenzung`, `kategoriesegmentierung-und-chancenanalyse` |
| 2 | **Ist Day One Analysis brauchbar?** | Abgewertet: **"superficial and insubstantial and therefore not worth the effort"**, seit den 1990ern unpopulär, **von namhaften CM-Beratungen aus den Methodiken gestrichen**, Kraljic sei später ohnehin besser | Als **"Essential"** geführt und **dreifach erweitert**: Machtbalance je Quadrant, Bündelungseffekt, Eignung von RFI/RFP/RFQ je Quadrant, PPCA-Lohnhaftigkeit je Quadrant | `portfolio-und-machtanalyse` |
| 3 | **Dürfen Kraljic und Supplier Preferencing gekreuzt werden?** | **CMH widerspricht sich selbst.** Stage 3: "when taken together and cross-referenced, **the full dynamic** of the analysis of the category can be seen". Act 20 Limitations: "The two are very different and **should not be automatically cross-referenced**", weil Kraljic eine Ausgabenkategorie und Preferencing einen Account-Management-Stil profiliert. **Und Act 21 (Dutch Windmill) baut trotzdem darauf auf** | Kreuzt sie systematisch, **aber nicht über die Quadrantennamen, sondern über die beiderseitige Abhängigkeit**. Liefert damit eine mögliche **Synthese**, die CMHs Einwand umgeht statt widerlegt | `portfolio-und-machtanalyse` |
| 4 | **Welche Veränderungstheorie trägt die Umsetzung?** | **Kotter, acht Schritte**, organisationsprozessual; zitiert die **"70% failure rate"**; verlangt Koalition, Vision, Kommunikation (Unterkommunikation um Faktor 10), Change Champions, Verankerung. Liefert die Kritik mit: es sei eine Liste, unterstelle Chronologie, überbetone die Widerstandsannahme, **und berücksichtige individuelle Persönlichkeit nicht** | **Lewin** (felt need; unfreeze/change/refreeze, **aber mit ausdrücklicher Relativierung**: "Chaos is no longer the exception but the new steady state") **plus Kübler-Ross (1969), individuelle Trauerkurve** mit phasenspezifischen Führungsantworten | `umsetzung-veraenderung-und-verhandlung` |
| 5 | **Wie lange dauert Kategoriemanagement?** | **8–16 Wochen** für die "End-to-End-Iteration", Stage 1 allein bis **6 Wochen**, Research mindestens **40%** der Projektzeit | Stufen 1–3: **1 bis 3 Monate**. Implementation: **6 bis 12 Monate**. Improvement: **weitere 6 bis 12+ Monate**. Also **Gesamtdauer bis zur abgeschlossenen Umsetzung ein Mehrfaches** | `prozessarchitektur-und-gateways` |
| 6 | **Wie viel Beratung ist angemessen?** | Durchgehend **beraterkritisch**: "overengineered toolkits that never really get implemented", "consultants love this kind of activity because it can help justify charging a large fee", **Berater verlassen Klienten in der Umsetzungsphase**, empfehlen umfassende Kategoriepläne unabhängig von der Kategoriegröße, nutzen Komplexitätsargumente zur PPCA-Selbstlegitimation, überziehen die Aktionsplanung | **Ist selbst Berater** (Positive Purchasing), führt vier eingetragene Marken, verweist auf drei eigene Bücher, ohne die das Werkzeugbild unvollständig bleibt, nennt ein eigenes Softwareprodukt (offengelegt). Beschreibt zugleich einen echten Nutzen des Beratervorgehens: die Datensammlung gewinnt Stakeholder und beginnt die Widerstandsminimierung | `grundlagen-und-abgrenzung`, plus Lesart-Hinweis im Kopf jeder Wissensdatei |

### Und die Gegenrichtung: zehn Stellen, an denen sich die Bücher unabhängig stützen
**Diese Belege sind für die Nutzung genauso wertvoll wie die Konflikte und werden leichter übersehen.**

1. **RAQSCI** ist in Reihenfolge, Logik und Begründung identisch, einschließlich des Zwecks, Kosten nicht zum Gesprächseinstieg zu machen. **Der klarste Konvergenzbeleg des Systems.**
2. **Tuckman (1965)** wird in beiden Büchern für die Teamentwicklung zitiert.
3. **Steele und Court (1996)** in beiden als Quelle des Supplier Preferencing.
4. **Kraljic (1983)** in beiden als Ursprung der Portfoliologik, **und beide nennen die Käuferperspektive als seine Grenze**.
5. **Die Zahl der Prozessstufen ist unwesentlich** — beide sagen es ausdrücklich und unabhängig ("There isn't a right or wrong number of stages" / "it really doesn't matter how many stages there are").
6. **Der Nutzenrealisierungsbefund**: CMHs "malaise, where procurement benefits are always projected on paper but rarely delivered in practice" und OBriens "declaring great savings but the finance community cannot see the bottom-line impact" sind derselbe Befund in zwei unabhängigen Formulierungen. **Das rechtfertigt Gebiet 10 als eigenes Themengebiet.**
7. **Finanzfunktion früh einbinden** — beide fordern es für die Nutzenmessung.
8. **Frühe Bewertung von Ideen vermeiden** (CMH) und **Bewertungskriterien vor der Ideengenerierung festlegen** (OBrien) ergeben zusammen eine schärfere Regel als jede Position allein.
9. **PPCA braucht keine Präzision**: CMHs Haltung "basic but developable" und OBriens Spalte "Firm or estimate" sind dieselbe Position, einmal als Grundsatz und einmal als Formular.
10. **Der Werkzeugkasten wird nie vollständig durchlaufen**: CMHs Beobachtung "sized to suit" bei über 40 Modellen und OBriens drei definierte Routen (Full, Fast track, Just do it) bestätigen sich gegenseitig.
11. **PESTLE und STEEPLE sind gleichwertig** — beide Bücher erklären die Akronymvarianten für weitgehend austauschbar und erledigen damit die Debatte.
12. **CM-Ziele in persönliche Ziele einbetten** — CMH als Schritt 4 des Implementation Cycle, OBrien als Verankerungsempfehlung.

## Agentenverzeichnis

| Datei | Funktion |
|---|---|
| `orchestrator.md` | Einstiegspunkt. Routing über 10 Spezialisten, Konsolidierung, Widerspruchsregeln, Quellenkennzeichnung, Lückenbenennung. **Verändert keine Wissensdateien** |
| `research_agent.md` | Newsletter-Recherche, Bewertungsrunde, laufende Wissenszufuhr, sechs vorrangige Beobachtungsaufträge. **Der einzige Weg für neues Wissen** |
| `specialist_*.md` | 10 Fachspezialisten, je mit eigener Wissensbasis und eigenem Grenzenabschnitt |

## Newsletter

Zuordnung siehe `newsletter_subscriptions.md`. **Stand: Phase 3 ausgeführt am 27.08.2026.** **Acht Quellen mit Bewertung 4 oder höher**, dazu fünf Nachschlagequellen und fünf benannte Recherchelücken.

**Die Bewertungen sind selbst vergeben, jeweils in der Rolle des zuständigen Spezialisten, und beruhen auf dem veröffentlichten Publikationsprofil, nicht auf mehrmonatiger Lesepraxis.** Das ist in der Datei ausdrücklich vermerkt, samt der Regel, die Bewertungen nach drei Monaten Betrieb anhand der tatsächlichen Trefferquote zu revidieren.

**Statische Referenz- und Lernseiten sind bewusst niedriger bewertet** und in einem eigenen Abschnitt geführt, weil sie keinen laufenden Informationszufluss erzeugen.

**Besonderheit dieses Systems**: **Fünf der acht Quellen haben eine Interessenlage** (zwei davon sind Publikationen von OBrien selbst, dazu ein Analystenhaus, ein Ratinganbieter und ein Beratungsunternehmen). Der Rechercheagent hat die Pflicht, sie bei jeder Übergabe zu benennen. **Das ist die konsequente Anwendung von CMHs Beraterkritik auf die Quellen dieses Systems selbst.**

## Konsistenzprüfung

Stand 27.08.2026, mechanisch geprüft:

| Prüfung | Ergebnis |
|---|---|
| Wissensdateien | **10** |
| Spezialisten | **10** — entspricht der Zahl der Wissensdateien |
| Agenten insgesamt | 12 (10 Spezialisten, Orchestrator, Rechercheagent) |
| Kürzel-Legende | in **10 von 10** Wissensdateien |
| Grenzenabschnitt | in **10 von 10** Spezialisten |
| Wissens-Update-Regel | in **10 von 10** Spezialisten |
| Referenzierte Wissensdateien | **alle existieren** |
| Veraltete Vorbehalte | **0** |
| Belege CMH | 215 |
| Belege OBrien | 232 |

**Zur Belegverteilung**: 215 zu 232 ist nahezu ausgeglichen, obwohl OBrien mit 192.911 zu 39.595 Wörtern **4,9-mal umfangreicher** ist. **Das ist kein Fehler, sondern folgt aus der Bauform der Bücher.** CMH dokumentiert 33 Werkzeuge in einem engen, wiederkehrenden Raster mit je eigenem Limitations-Abschnitt und erzeugt damit viele kurze, einzeln belegbare Aussagen. OBrien argumentiert über längere Strecken und liefert weniger, aber umfangreichere Belegstellen. **Für die Nutzung heißt das: CMH ist die dichtere Quelle für Werkzeuggrenzen, OBrien die dichtere für Verfahren und Zahlen.**

## Bekannte Lücken

1. **Verhandlungsführung** liegt nur hochaggregiert vor (zehn Tipps, LDO/MDO/ZoMA). OBrien lagert sie in *Negotiation for Procurement and Supply Chain Professionals* aus, CMH behandelt sie nicht als Werkzeug.
2. **SRM in der Tiefe** fehlt. Das Orchestra of SRM® ist nur in Übersicht erfasst; die Vollausführung liegt in OBriens *Supplier Relationship Management*.
3. **Nachhaltige Beschaffung als Methodensystem** fehlt. Die **OMEIA®**-Methode wird genannt, aber nicht ausgeführt; sie liegt in OBriens *Sustainable Procurement*.
4. **Handelssortimentsmanagement im Marketingsinn** ist nur als Abgrenzung und als Brücke zum End-to-End-Ansatz behandelt, nicht als eigene Methodik. **Das schließt die im SCM-System des Vaults notierte Lücke "Sortiments- und Category Management im Handel" nur teilweise**, weil hier beschaffungsseitiges CM behandelt wird.
5. **Vertragsrecht, Vergaberechtsverfahren im Detail und Investitionsrechnung** (NPV, IRR, Amortisation) liegen außerhalb beider Bücher.
6. **Deutscher und EU-Vergaberechtsrahmen im Detail** fehlt. OBrien behandelt EU-Prinzipien und UK nach Brexit; VgV, UVgO und GWB kommen nicht vor. Als Recherchelücke 2 vermerkt.
7. **Mathematische und statistische Analyseverfahren** (Regressionen, Preisindexmodelle, Sensitivitätsanalyse als Verfahren) fehlen.
8. **Aktualität**: **CMH stammt von 2018** und kennt weder generative KI, noch die Lieferkettengesetze der 2020er, noch die Nachpandemie-Volatilität. **OBrien reicht bis 2024** und kennt CSDDD in der Fassung vor der Schwellenanhebung nicht. Der stehende Beobachtungsauftrag des Rechercheagenten adressiert das.
9. **Die Zellinhalte des Category Strategy Cube** (CMH Figure 4.3) waren nicht per OCR erfassbar. Nur Dimensionen und Wertmerkmale sind belegt. Zur Konkretisierung sind OBriens Value Levers zu nutzen.
10. **OCR-Restfehler in beiden Büchern.** Die Erfassung erfolgte über Texterkennung. Vereinzelte Zeichenfehler in Zahlen und Eigennamen sind möglich. Bei kritischen Zahlen empfiehlt sich ein Blick in die Arbeitskopie unter `~/.aria-book-cache/` oder ins Buch.
11. **Empirische Basis der Einsparungsmatrix**: OBrien kennzeichnet seine Schätzmatrix (1% bis 20%) ausdrücklich als **nicht auf einer empirischen Studie beruhend**. Bei jeder Verwendung mitzuteilen.

## Regeln

1. **Wissenshoheit**: Spezialisten erhalten neues Wissen ausschließlich über den Rechercheagenten. Keine andere Quelle darf ihre Wissensdateien verändern, **auch nicht der Orchestrator**.
2. **Quellenangabe**: Jedes Stück Wissen trägt seine Quelle, also `[Quelle: CMH, ...]`, `[Quelle: OBrien, Kap N]` oder `[Quelle: Newsletter-Name, Datum]`. **Der Charakter der Quelle wird mitgenannt, wo er die Aussage prägt.**
3. **Widersprüche werden nicht aufgelöst**: Wo die Bücher sich widersprechen, werden beide Positionen samt Belegen dargelegt. Das gilt für die sechs Registereinträge und für jeden künftigen Widerspruch aus Newsletter-Inhalten. **Eine Synthese darf benannt werden, aber nur als Synthese.**
4. **Keine Halluzination**: Was nicht in der Wissensbasis steht, wird nicht erfunden. Der Spezialist sagt es ausdrücklich und verweist auf seinen Grenzenabschnitt.
5. **Rückfragen**: Ein bis zwei gezielte Rückfragen sind erlaubt, wenn die Problemstellung zu unspezifisch ist.
6. **Grenzen aktuell halten**: Die Abschnitte `## Grenzen` der Spezialisten veralten bei jeder Systemerweiterung und sind Teil des Umfangs jeder Erweiterung, nicht eine Nacharbeit. **Ein Spezialist, der auf eine geschlossene Lücke verweist, ist schlechter als einer ohne Grenzenabschnitt.**
7. **Limitations nicht unterdrücken**: Wenn ein Werkzeug empfohlen wird, gehören seine dokumentierten Grenzen zur Antwort. CMH liefert sie zu jedem der 33 Werkzeuge.
