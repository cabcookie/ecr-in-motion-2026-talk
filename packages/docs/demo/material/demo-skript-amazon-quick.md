# Demo-Skript: Amazon Quick für ALDI SÜD Supply Chain Management

**Persona:** Markus Weber, Einkäufer bei ALDI SÜD  
**Verantwortung:** 54–60 SKUs, Lieferantenverhandlungen, Vertragsmanagement  
**Systeme:** SAP S/4HANA, Microsoft Outlook, Microsoft Teams, Manhattan WMS  
**Dauer:** ca. 20–25 Minuten

---

## Vorbereitung

Vor der Demo sicherstellen:

1. Simulation ist gestartet (alle 4 MCP-Server in Amazon Quick konfiguriert)
2. Datenbank ist frisch geseeded (`rm -f simulation.db` und Neustart falls nötig)
3. Amazon Quick Desktop App ist geöffnet

---

## Akt 1: Morgens im Büro – Der Feed & die Übersicht

**Erzählung:** _Markus Weber beginnt seinen Arbeitstag. Früher musste er zwischen Outlook, Teams, SAP und dem WMS hin- und herwechseln, um sich einen Überblick zu verschaffen. Mit Amazon Quick hat er einen einzigen Einstiegspunkt._

### Schritt 1.1 – Identität und Kontext

**Eingabe in Quick:**

> Who am I and what is my role?

**Erwartetes Ergebnis:** Quick zeigt Markus' Rolle (Einkauf), seine Zuständigkeiten (54–60 SKUs, Lieferantenverhandlungen) und seine angebundenen Systeme.

**Demo-Punkt:** Quick kennt den Nutzer und seinen organisatorischen Kontext.

---

### Schritt 1.2 – Der Feed: Quick zeigt proaktiv, was heute wichtig ist

**Aktion:** Den Amazon Quick Feed öffnen/anschauen (kein Prompt nötig – Quick zeigt das von allein).

**Erwartetes Ergebnis:** Der Feed zeigt Markus' Tagesplan:

- **Termine:** Lieferantengespräch Storck – Preisverhandlung (in 2h, Teams-Call mit Andreas Becker & Sandra Klein), Einkauf Team Standup, 1:1 mit Sandra, Dual-Sourcing Kaffee Zwischenstand
- **Empfehlung von Quick:** _"Vorbereitung für Storck-Gespräch: Preisanpassung +3–4% diskutieren, Alternative Süßwaren-Lieferanten recherchieren"_
- **Wichtige Nachrichten:** Temperaturalarm Kühllager (dringend), Coverage-Days Warnung (dringend)
- **Weitere Updates:** Lieferverzögerung NewCoffee, Bauckhof-Substitution bestätigt, Lagerkapazität VZ Duisburg

**Demo-Punkt:** Quick wartet nicht auf eine Frage – es zeigt proaktiv den Tagesplan, priorisiert Nachrichten nach Dringlichkeit und empfiehlt konkrete nächste Schritte. Markus sieht auf einen Blick: In 2 Stunden steht die Storck-Verhandlung an, und Quick schlägt bereits vor, sich darauf vorzubereiten.

---

### Schritt 1.3 – Auf die Empfehlung eingehen: Storck-Vorbereitung

**Eingabe in Quick:** (auf die Empfehlung im Feed klicken, oder eintippen)

> Bereite mich auf das Storck-Gespräch vor. Was ist der Hintergrund, was fordern sie, und wie ist unsere Position?

**Erwartetes Ergebnis:** Quick fasst alle relevanten Informationen zusammen:

- **E-Mail von Storck** (vor 7 Tagen): Preisanpassung zum 01.08. – Merci +4,5%, Toffifee +3,8%, Knoppers +3,2%. Begründung: gestiegene Rohstoff- und Energiekosten.
- **Markus' Antwort:** Termin für diese Woche zugesagt (Mi oder Do).
- **Teams-Chat mit Peter Hoffmann:** Peter braucht die finalen Konditionen für die Sortimentsplanung.
- **Lieferanten-Performance:** Storck OTD-Score 91,4% (leichter Rückgang laut Sandra).
- **Mögliche Verhandlungsposition:** OTD-Rückgang als Gegenargument, Alternativlieferanten als Druckmittel.

**Demo-Punkt:** **Kernfunktion** – Quick zieht automatisch Kontext aus E-Mails, Teams-Chats UND SAP-Daten zusammen und liefert ein fertiges Briefing für die Verhandlung. Das spart 15–20 Minuten manuelle Recherche und Markus geht bestens vorbereitet ins Gespräch.

---

### Schritt 1.4 – Feed weiter nutzen: E-Mails gezielt filtern

**Eingabe in Quick:**

> Zeig mir E-Mails von FreshFruit Import

**Erwartetes Ergebnis:** Nur E-Mails vom Lieferanten FreshFruit Import werden angezeigt (Lieferverzögerung + Update Hafenstreik beendet).

**Demo-Punkt:** Kontextbasierte Filterung – kein manuelles Suchen in Outlook nötig.

---

## Akt 2: Cross-Channel-Analyse – Teams + Outlook zusammenführen

**Erzählung:** _Markus will verstehen, was im Team bezüglich des Kühlproblems in Duisburg besprochen wurde. Die Informationen verteilen sich über E-Mail UND Teams._

### Schritt 2.1 – Teams-Kanäle einsehen

**Eingabe in Quick:**

> Welche Teams-Kanäle gibt es und was wurde zuletzt besprochen?

**Erwartetes Ergebnis:** Quick zeigt die Teams-Threads:

- Hafenstreik-Diskussion (Einkauf-Team)
- Kühlung VZ Duisburg (Logistik-SCM)
- Coverage-Days Warnung (Logistik-SCM)
- Quartals-Review Reminder
- Storck Preislisten

**Demo-Punkt:** Quick verbindet Teams und Outlook – ein einheitlicher Informationsraum.

---

### Schritt 2.2 – Kontext-Synthese

**Eingabe in Quick:**

> Was ist der aktuelle Stand zum Kühlproblem in Duisburg? Fasse mir die Informationen aus E-Mails und Teams zusammen.

**Erwartetes Ergebnis:** Quick kombiniert:

- Die E-Mail von Thomas Müller (Temperaturalarm, +6°C für 45 Min)
- Den Teams-Thread (Sektion C betroffen, SKUs 2302, 2103, 2104, 2202, QS prüft)
- Julias Nachfrage zur Umroutung auf VZ Mülheim

Quick gibt eine zusammenfassende Antwort mit den relevanten Fakten.

**Demo-Punkt:** **Kernfunktion** – Quick synthetisiert Informationen aus mehreren Systemen zu einer kohärenten Zusammenfassung. Das spart Markus 10–15 Minuten manuelle Recherche.

---

## Akt 3: Operative Entscheidungen – Bestandsprüfung & WMS

**Erzählung:** _Sandra hat vor kritisch niedrigen Beständen gewarnt. Markus will die aktuelle Lage im Warehouse Management System prüfen._

### Schritt 3.1 – Kritische Bestände anzeigen

**Eingabe in Quick:**

> Zeig mir alle SKUs mit kritisch niedrigen Coverage-Days (unter 3 Tage)

**Erwartetes Ergebnis:** Quick fragt das WMS ab und zeigt:

- Bio-Joghurt natur (SKU 2203): 1,8 Tage
- Frische Vollmilch 1L Bio (SKU 2105): 2,1 Tage
- Deutsche Markenbutter 250g (SKU 2301): 2,5 Tage
- Salat Eisberg (SKU 5106): 2,8 Tage
- Sahne 200ml (SKU 2107): 2,9 Tage

**Demo-Punkt:** Direkte WMS-Abfrage aus Quick heraus – kein Systemwechsel zu Manhattan WMS nötig.

---

### Schritt 3.2 – Bestände an einem Standort

**Eingabe in Quick:**

> Wie sieht der Bestand im VZ Mülheim aus?

**Erwartetes Ergebnis:** Quick zeigt alle SKUs am Standort VZ-Mülheim mit Mengen und Coverage-Days.

**Demo-Punkt:** Standort-spezifische Bestandsabfrage in Sekundenschnelle.

---

## Akt 4: Lieferanten-Performance & Supply Chain KPIs

**Erzählung:** _Markus will die Gesamtlage seiner Supply Chain verstehen und die Performance seiner Lieferanten bewerten._

### Schritt 4.1 – Supply Chain KPIs

**Eingabe in Quick:**

> Wie ist der aktuelle Supply-Chain-Status? Zeig mir die KPIs der letzten 7 Tage.

**Erwartetes Ergebnis:** Quick zeigt aus SAP:

- OTD (On-Time Delivery): ca. 95%
- OSA (On-Shelf Availability): ca. 97%
- Kostenabweichung: ca. 2%
- MAPE (Forecast-Genauigkeit): ca. 12%

Plus Verlauf der letzten 7 Tage.

**Demo-Punkt:** ERP-Daten direkt in Quick – Management-Dashboard ohne SAP-Transaktion.

---

### Schritt 4.2 – Lieferanten-Performance

**Eingabe in Quick:**

> Zeig mir die Performance aller Lieferanten, sortiert nach OTD-Score

**Erwartetes Ergebnis:** Quick zeigt alle 10 Lieferanten mit OTD-Score, Region, Risikocluster und Vertragsstatus. Auffällig:

- FreshFruit Import: 85,3% OTD (unterdurchschnittlich)
- Kölln: 87,5% OTD (in Verhandlung)
- Müller Milch: 98,1% OTD (Top-Performer trotz aktuellem Engpass)

**Demo-Punkt:** Datengetriebene Lieferantenbewertung – Grundlage für Verhandlungen und Eskalationen.

---

### Schritt 4.3 – Risikocluster filtern

**Eingabe in Quick:**

> Welche Lieferanten gehören zum Risikocluster "geo_energy_transport"?

**Erwartetes Ergebnis:** Quick filtert auf Lieferanten mit Transportrisiken (NewCoffee, FreshFruit Import, Dole, NordGrain).

**Demo-Punkt:** Risikomanagement – Markus kann proaktiv handeln bei geopolitischen/logistischen Krisen.

---

## Akt 5: Aktion ausführen – Bestellung auslösen

**Erzählung:** _Aufgrund der kritisch niedrigen Coverage-Days bei Molkereiprodukten entscheidet Markus, eine Nachbestellung bei Müller Milch auszulösen – direkt aus Quick heraus._

### Schritt 5.1 – Bestellung erstellen

**Eingabe in Quick:**

> Erstelle eine Bestellung bei Müller Milch für 5000 Einheiten Frische Vollmilch 1L Bio (SKU 2105) mit gewünschtem Liefertermin 2025-07-25

**Erwartetes Ergebnis:** Quick legt einen Purchase Order im SAP an:

- PO-Nummer wird generiert (z.B. PO-2025-0005)
- Lieferant: Müller Milch GmbH
- Status: "Offen"
- Bestätigungsmeldung: "Bestellung erfolgreich im SAP angelegt. Der Lieferant wird automatisch benachrichtigt."

**Demo-Punkt:** **Kernfunktion** – Markus kann direkt aus der Konversation heraus eine Bestellung im ERP-System auslösen. Kein Wechsel zu SAP, keine manuelle Transaktion. Das ist der Unterschied zwischen "Informieren" und "Handeln".

---

### Schritt 5.2 – Bestellübersicht

**Eingabe in Quick:**

> Zeig mir alle aktuellen Bestellungen

**Erwartetes Ergebnis:** Quick zeigt alle Purchase Orders mit Status:

- PO-2025-0001: NewCoffee, Bio Arabica – Bestätigt
- PO-2025-0002: Müller Milch, Vollmilch – Versendet
- PO-2025-0003: FreshFruit, Bananen – Offen
- PO-2025-0004: Storck, Merci – Bestätigt
- PO-2025-0005: Müller Milch, Vollmilch Bio – Offen (gerade erstellt)

**Demo-Punkt:** Vollständige Nachvollziehbarkeit – alle Bestellungen im Überblick.

---

## Akt 6: Kommunikation – E-Mail senden

**Erzählung:** _Markus möchte Sandra Klein über die ausgelöste Bestellung informieren und Thomas Müller nach dem Status der Kühlung fragen._

### Schritt 6.1 – Kollegin informieren

**Eingabe in Quick:**

> Schreibe eine E-Mail an sandra.klein@aldi-sued.de mit dem Betreff "Nachbestellung Müller Milch ausgelöst" und dem Text: "Hallo Sandra, ich habe gerade 5000 VE Frische Vollmilch Bio bei Müller Milch nachbestellt (PO-2025-0005). Liefertermin 25.07. Damit sollten wir die Coverage-Days für SKU 2105 wieder stabilisieren. VG Markus"

**Erwartetes Ergebnis:** Quick sendet die E-Mail und bestätigt den Versand.

**Demo-Punkt:** Direkte Aktion aus dem Arbeitskontext heraus – keine Kontextwechsel.

---

### Schritt 6.2 – Teams-Nachricht senden

**Eingabe in Quick:**

> Sende eine Nachricht in Teams an thomas.mueller@aldi-sued.de: "Thomas, gibt es ein Update zur Kühlung in Sektion C? Muss ich die betroffenen SKUs umplanen?"

**Erwartetes Ergebnis:** Quick sendet die Teams-Nachricht und bestätigt.

**Demo-Punkt:** Quick bedient alle Kommunikationskanäle – Outlook UND Teams aus einer Oberfläche.

---

## Akt 7: Disruption – Krise simulieren

**Erzählung:** _Jetzt zeigen wir die Disruption-Simulation. Ein unerwartetes Ereignis tritt ein – zum Beispiel eine Lieferketten-Disruption durch einen Hafenstreik, der mehrere Lieferanten betrifft. Diese Art von Ereignis würde auf Markus' Tisch landen und sofortiges Handeln erfordern._

### Schritt 7.1 – Disruption auslösen

**Eingabe in Quick:**

> Löse eine Lieferketten-Disruption aus: Szenario "supply_chain_disruption", Dauer 21 Tage, Beschreibung "Großer Hafenstreik in Hamburg und Rotterdam – Containerverkehr liegt für 3 Wochen still"

**Erwartetes Ergebnis:** Quick erstellt ein Disruption-Event im System:

- Event-ID wird generiert
- Szenario: supply_chain_disruption
- Margin-Impact: 50 Basispunkte
- Betroffene SKUs werden automatisch ermittelt (Kaffee, Bananen, Zitronen etc.)
- Status: "pending"

**Demo-Punkt:** **Kernfunktion** – Disruptions-Szenarien können in der Simulation ausgelöst werden. In der Realität würden diese Events automatisch erkannt (z.B. über News-Feeds oder Lieferanten-Meldungen) und als Alert auf Markus' Tisch landen.

---

### Schritt 7.2 – Auswirkungen prüfen

**Eingabe in Quick:**

> Welche Lieferanten sind vom Risikocluster "geo_energy_transport" betroffen und wie ist deren aktuelle OTD-Performance?

**Erwartetes Ergebnis:** Quick zeigt die betroffenen Lieferanten:

- NewCoffee Trading (Südamerika/Hamburg): 96,2% OTD
- FreshFruit Import (Ecuador/Kolumbien): 85,3% OTD
- Dole Europe (Mittelamerika/Hamburg): 93,2% OTD
- NordGrain Handels (Bremen): 95,6% OTD

**Demo-Punkt:** Sofortige Risikoanalyse – Markus kann bewerten, welche Lieferanten und Produkte am stärksten betroffen sind.

---

### Schritt 7.3 – Eskalationshistorie prüfen

**Eingabe in Quick:**

> Gibt es offene Eskalationen?

**Erwartetes Ergebnis:** Quick zeigt die Eskalationshistorie mit Level, auslösendem KPI und Status.

**Demo-Punkt:** Eskalations-Tracking – Markus sieht, welche Themen bereits hocheskaliert sind und wo er handeln muss.

---

### Schritt 7.4 – Proaktive Maßnahme

**Eingabe in Quick:**

> Erstelle eine Bestellung bei Dole Europe für 4000 Einheiten Bananen 1kg (SKU 5101) mit Liefertermin 2025-07-28 als Absicherung gegen den Hafenstreik

**Erwartetes Ergebnis:** Quick legt die Sicherheitsbestellung im SAP an.

**Demo-Punkt:** Markus reagiert sofort auf die Disruption – von der Information zur Aktion in einer einzigen Konversation.

---

## Akt 8: Zusammenfassung & Closing

**Erzählung:** _Abschließend zeigen wir, wie Quick den gesamten Arbeitstag von Markus vereinfacht hat._

### Zusammenfassung für das Publikum

**Was wir gezeigt haben:**

| Feature                     | Demo-Schritt                           | Zeitersparnis            |
| --------------------------- | -------------------------------------- | ------------------------ |
| **Feed & Übersicht**        | Ungelesene Mails, E-Mail-Liste, Filter | 5–10 Min/Tag             |
| **Cross-Channel-Synthese**  | E-Mails + Teams zusammenführen         | 10–15 Min pro Vorfall    |
| **WMS-Abfrage**             | Bestände, Coverage-Days, Standorte     | 5 Min pro Abfrage        |
| **Supply Chain KPIs**       | OTD, OSA, Kosten, Forecast             | 10 Min/Tag               |
| **Lieferanten-Performance** | OTD-Scores, Risikocluster              | 15 Min pro Bewertung     |
| **Bestellung auslösen**     | Purchase Order direkt in SAP           | 10–15 Min pro Bestellung |
| **Kommunikation**           | E-Mail + Teams aus Quick               | 5 Min pro Nachricht      |
| **Disruption-Management**   | Szenario, Analyse, Reaktion            | 30+ Min pro Krisenfall   |

**Kernbotschaft:** Amazon Quick macht Markus nicht nur schneller – es verändert die Art, wie er arbeitet. Statt zwischen 4 Systemen zu wechseln, hat er einen intelligenten Arbeitsassistenten, der:

1. **Informiert** – über alle Kanäle hinweg
2. **Analysiert** – KPIs, Risiken, Bestände
3. **Handelt** – Bestellungen, E-Mails, Nachrichten
4. **Alarmiert** – bei Disruptionen und Eskalationen

---

## Verfügbare Disruption-Szenarien (für Variationen)

Falls in der Demo ein anderes Szenario gewünscht wird:

| Szenario                | ID                        | Margin-Impact | Dauer    |
| ----------------------- | ------------------------- | ------------- | -------- |
| Rückruf                 | `recall`                  | 18 bps        | 7 Tage   |
| Verpackungsänderung     | `packaging_change`        | 18 bps        | 14 Tage  |
| Saisonale Spitzen       | `seasonal_peaks`          | 22 bps        | 21 Tage  |
| IT-Ausfall              | `it_outage`               | 25 bps        | 3 Tage   |
| Extremwetter            | `extreme_weather`         | 30 bps        | 14 Tage  |
| Mindestlohnerhöhung     | `minimum_wage_increase`   | 45 bps        | 90 Tage  |
| Lieferketten-Disruption | `supply_chain_disruption` | 50 bps        | 30 Tage  |
| Pandemie                | `pandemic`                | 125 bps       | 180 Tage |

---

## Tipps für den Präsentierenden

- **Natürlich sprechen:** Die Eingaben in Quick sind natürliche Sprache – variiere die Formulierungen, um zu zeigen, dass es kein Scripting ist.
- **Pausen einbauen:** Nach jeder Quick-Antwort kurz auf die Ergebnisse eingehen und den Business-Value erklären.
- **Fehler nutzen:** Falls Quick nachfragt oder eine Eingabe nicht versteht – das zeigt, dass es ein echtes KI-System ist, kein Click-Through.
- **Reihenfolge anpassen:** Die Akte können je nach Publikum umgestellt werden. Für technisch Interessierte mehr WMS/SAP, für Management mehr KPIs und Disruption.
- **Vor der Demo:** Einmal die Schritte 1.1–1.3 durchspielen, um sicherzustellen, dass die MCP-Server korrekt verbunden sind.
