# Category Management — Multi-Agent Knowledge System

Ein Team aus zwölf Agenten, das das Wissen zweier Fachbücher zum beschaffungsseitigen Category Management zugänglich macht: **10 Fachspezialisten**, ein **Orchestrator** als Einstiegspunkt und ein **Rechercheagent** als einziger Weg für neues Wissen.

## Grundlage

| Kürzel | Werk | Umfang |
|---|---|---|
| **CMH** | Cordell, Andrea & Thompson, Ian: *The Category Management Handbook*, Routledge 2018 | 39.595 Wörter, 5 Stufen, 33 Werkzeuge mit je eigener Kritik |
| **OBrien** | O'Brien, Jonathan: *Category Management in Purchasing*, 5. Auflage, Kogan Page 2024 | 192.911 Wörter, 10 Kapitel, 5i®-Prozess plus Stage 0 |

Beide Bücher behandeln **Category Management auf der Einkaufsseite**, nicht Sortimentsmanagement im Handel. Die Verbindung zum Marketing-Kategoriemanagement wird als Brücke behandelt, nicht als eigene Methodik.

## Nutzung

**Einstieg immer über `agents/orchestrator.md`.** Er enthält die Routingtabelle, die typischen Mehrfachzuständigkeiten und die Regeln für Widersprüche, Quellenkennzeichnung und Wissenslücken.

Direkte Nutzung eines Spezialisten ist möglich, wenn das Themengebiet klar ist. Jeder Spezialist nennt in seiner Datei die Wissensbasis, sein Verhalten und seine **Grenzen**.

## Die zehn Themengebiete

| Frage | Spezialist | Wissensdatei |
|---|---|---|
| Was ist CM, was bringt es, wie grenzt es sich ab? Öffentlicher Sektor, Handel, KI | `specialist_grundlagen` | `grundlagen-und-abgrenzung.md` |
| Welche Kategorien bilden und in welcher Reihenfolge bearbeiten? | `specialist_segmentierung` | `kategoriesegmentierung-und-chancenanalyse.md` |
| Wie ist der Prozess aufgebaut, wo sind die Freigabepunkte, wie lange dauert es? | `specialist_prozess` | `prozessarchitektur-und-gateways.md` |
| Wer macht was, wie ist das Team aufgestellt, welche Kompetenzen braucht es? | `specialist_governance` | `governance-team-und-rollen.md` |
| Was braucht das Geschäft wirklich? RAQSCI, Spezifikationen, KPI-Ableitung | `specialist_anforderungen` | `anforderungen-und-bedarfsermittlung.md` |
| Welche Fakten brauchen wir? Kostenzerlegung, Preismodelle, TCO, Marktkräfte | `specialist_daten` | `datenerhebung-kostenanalyse-und-marktverstaendnis.md` |
| Wer hat die Macht? Kraljic, Supplier Preferencing, Abhängigkeiten | `specialist_portfolio` | `portfolio-und-machtanalyse.md` |
| Wie entsteht die Strategie und wie wird zwischen Optionen entschieden? | `specialist_strategie` | `strategieentwicklung-und-optionsbewertung.md` |
| Wie wird umgesetzt? Veränderung, Ausschreibung, Verhandlung, Vertrag | `specialist_umsetzung` | `umsetzung-veraenderung-und-verhandlung.md` |
| Kommt der Nutzen an? Nutzenmessung, SRM, laufende Verbesserung | `specialist_nutzenrealisierung` | `nutzenrealisierung-und-laufende-verbesserung.md` |

## Was dieses System besonders macht

**Die Widersprüche sind das Ergebnis, nicht das Problem.** Zwei gute Bücher zum gleichen Fachgebiet widersprechen sich. In `config/system_overview.md` sind **sechs Widersprüche** dokumentiert und bewusst offen gelassen, darunter:
- Welche Einsparung ist erwartbar — 20 bis 25 Prozent als Ziel oder 10 bis 14 Prozent als Erwartungswert?
- Wie lange dauert Kategoriemanagement — 8 bis 16 Wochen oder mehrere Jahre?
- Welche Veränderungstheorie trägt die Umsetzung — Kotter oder Kübler-Ross?
- Und ein **Widerspruch eines Buches gegen sich selbst**: Darf man Kraljic und Supplier Preferencing kreuzen? CMH empfiehlt es in Stufe 3 und warnt in Aktivität 20 davor, baut aber Aktivität 21 darauf auf.

**Der Prüfstein für die Ehrlichkeit der Darstellung**: Lässt sich aus einer Wissensdatei heraus auch die jeweils andere Position vertreten? Wenn nicht, wurde der Widerspruch harmonisiert.

**Ebenso dokumentiert: zwölf Stellen, an denen sich die Bücher unabhängig stützen** — vom identischen RAQSCI-Framework über Tuckman und Steele/Court bis zu dem in beiden Büchern unabhängig formulierten Kernbefund, dass Beschaffungsvorteile auf Papier deklariert, aber nicht im Ergebnis sichtbar werden.

## Struktur

```
Category Management/
├── knowledge/                                          10 Wissensdateien
│   ├── grundlagen-und-abgrenzung.md
│   ├── kategoriesegmentierung-und-chancenanalyse.md
│   ├── prozessarchitektur-und-gateways.md
│   ├── governance-team-und-rollen.md
│   ├── anforderungen-und-bedarfsermittlung.md
│   ├── datenerhebung-kostenanalyse-und-marktverstaendnis.md
│   ├── portfolio-und-machtanalyse.md
│   ├── strategieentwicklung-und-optionsbewertung.md
│   ├── umsetzung-veraenderung-und-verhandlung.md
│   └── nutzenrealisierung-und-laufende-verbesserung.md
├── agents/                                             12 Agenten
│   ├── orchestrator.md                                 Einstiegspunkt
│   ├── research_agent.md                               einziger Weg für neues Wissen
│   └── specialist_*.md                                 10 Fachspezialisten
├── config/
│   ├── system_overview.md                              Widerspruchsregister, Erfassungsmethode, Lücken
│   └── newsletter_subscriptions.md                     8 Quellen, 5 Nachschlagequellen, 5 Recherchelücken
├── Buchempfehlungen.md                                 die beiden Quellen mit ASIN
└── README.md
```

## Regeln des Systems

1. **Wissenshoheit** — Spezialisten erhalten neues Wissen ausschließlich über den Rechercheagenten. Auch der Orchestrator verändert keine Wissensdatei.
2. **Quellenangabe** — jedes Stück Wissen trägt `[Quelle: CMH, ...]`, `[Quelle: OBrien, Kap N]` oder `[Quelle: Newsletter-Name, Datum]`. Der Charakter der Quelle wird mitgenannt, wo er die Aussage prägt.
3. **Widersprüche werden dokumentiert, nicht aufgelöst.** Eine Synthese darf benannt werden, aber nur als Synthese.
4. **Keine Halluzination** — was nicht in der Wissensbasis steht, wird als Lücke benannt.
5. **Rückfragen erlaubt** — ein bis zwei gezielte, wenn die Problemstellung zu unspezifisch ist.
6. **Grenzen aktuell halten** — die Grenzenabschnitte veralten bei jeder Erweiterung und gehören zum Umfang der Erweiterung.
7. **Limitations nicht unterdrücken** — wenn ein Werkzeug empfohlen wird, gehören seine dokumentierten Grenzen zur Antwort.

## Lesart der beiden Quellen

Der Unterschied im Charakter der Bücher ist selbst Teil des Wissens:
- **CMH** ist beraterkritisch und stellt jedes Werkzeug mit einem eigenen **Limitations**-Abschnitt dar. Es ist die bessere Quelle für die **Grenzen** eines Werkzeugs.
- **OBrien** ist das Rahmenwerk eines praktizierenden Beraters mit eigenen eingetragenen Marken und Verweisen auf drei Schwesterbücher. Es ist die bessere Quelle für **Operationalisierung, gerechnete Beispiele und aktuelle Kontextfragen**, trägt aber eine Interessenlage.

**Dieselbe Skepsis gilt für die Newsletter-Quellen**: Fünf der acht abonnierten Quellen haben eine Interessenlage, zwei davon sind Publikationen von OBrien selbst. Der Rechercheagent hat die Pflicht, sie bei jeder Übergabe zu benennen.

## Wichtige Abdeckungsgrenzen

- **Verhandlungsführung** und **SRM in der Tiefe** sind bei OBrien in Schwesterbücher ausgelagert und hier nur hochaggregiert erfasst.
- **Handelssortimentsmanagement im Marketingsinn** ist nur als Abgrenzung und Brücke behandelt.
- **Vertragsrecht, Vergaberechtsverfahren im Detail, Investitionsrechnung und deutscher Vergaberechtsrahmen** liegen außerhalb beider Bücher.
- **CMH kennt keine Entwicklungen nach 2018**, insbesondere nicht generative KI und die Lieferkettengesetze der 2020er.
- Beide Bücher wurden per Texterkennung erfasst. Bei kritischen Zahlen ist die Arbeitskopie unter `~/.aria-book-cache/` oder das Buch zu prüfen.

Die vollständige Lückenliste mit elf Einträgen steht in `config/system_overview.md`.

## Verwandte Systeme im Vault

- **`Books/Supply Chain Management`** — Netzwerkdesign, Bestände, Prognose, Transport, Pricing, Nachhaltigkeit in der Lieferkette. Berührungspunkte bei Lieferantenbeziehungen, TCO und Lieferkettenanalyse.
- **`Books/Theory of Constraints`** — Engpasstheorie, Denkprozesse, Veränderungspsychologie, Methodenintegration von JIT, TQM und Lean. Die CI-Werkzeuge dieses Systems (PDCA, Kaizen, DMAIC, TQM, Ishikawa) sind dort tiefer behandelt.
