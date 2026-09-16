<!--
Der Abspann des Vortrags — eine Datei, drei Auftritte.

  1. Die Antwortmail haengt ihn unter jede Antwort, als reinen Text.
  2. Die letzte Folie zeigt ihn im Saal.
  3. Die letzte Seite des PDFs druckt ihn.

Deshalb steht hier MARKDOWN und kein fertiger Mailtext: Eine Folie braucht
Ueberschriften und Eintraege, die Mail braucht Fliesstext. Wer beides von Hand
pflegt, pflegt es zweimal — und merkt den Unterschied erst, wenn jemand auf
einen toten Link klickt.

Fuer die Mail wird das Markdown heruntergerechnet: ## faellt weg, aus einem
Link wird sein Text und darunter die nackte Adresse, Zeilen brechen bei 70
Zeichen. Adressen stehen dabei IMMER allein auf ihrer Zeile — eine
umgebrochene URL ist kein Link mehr. 'pnpm mail:test' prueft das.

WAS DU SCHREIBEN KANNST, und mehr versteht der Leser nicht:

  ## Ueberschrift                    beginnt einen Abschnitt
  Ein Absatz                         die Einleitung dieses Abschnitts
  - [Titel](adresse) — Beschreibung  ein Eintrag
  <adresse>                          eine nackte Adresse, allein auf der Zeile

ALLES VOR DER ERSTEN ## IST NUR FUER DIE MAIL. Der Dank, die drei Adressen und
der Satz zur Mailadresse gehoeren in ein Postfach, nicht auf eine
Leinwand. Folie und PDF beginnen bei der ersten Ueberschrift.

DEN ERSTEN SATZ bitte stehen lassen. Der EU AI Act verlangt, dass
erkennbar ist, wenn eine Maschine nach aussen kommuniziert, und der
Vortrag beruft sich darauf (Hinweis an der letzten Folie). Faellt er
weg, schlaegt 'pnpm mail:test' an.

ZUR AUSWAHL DER LINKS, zwei Regeln, beide teuer erkauft — hier standen schon
einmal Adressen, die nur auf Startseiten fuehrten:

1. Jeder Link fuehrt dorthin, wo es losgeht. Nicht auf eine Uebersicht, von
   der aus der Leser selbst weitersuchen muss. Ein Beleg, den man sich erst
   suchen muss, ist keiner.
2. Vier Abschnitte, weil vier verschiedene Menschen mitlesen: wer selbst
   ausprobieren will, wer es verstehen muss, wer es bauen soll, und wer es
   nicht allein anfangen moechte.

Preise nur, wo sie oeffentlich sind. tecRacer nennt zu seinen Einstiegen
keine — das sagt die Zeile dann auch, statt es offenzulassen.

Vier Abschnitte passen nebeneinander auf die Folie. Ein fuenfter waere zu
viel; davor bricht 'pnpm papier:test' ab.

DER SATZ ZUR MAILADRESSE muss stimmen. Die Adresse liegt in der Rohmail
(S3 im Domain-Konto, ohne Ablauf - der Bucket ist zugleich ein privates
Postfach), im Verlauf des Agenten (DynamoDB und Sitzungs-Bucket, ohne
Ablauf) und im Protokoll der Mail-Lambda (sieben Tage). Die ersten beiden
loescht Carsten nach dem Vortrag von Hand. Wer daran etwas aendert, aendert
den Satz mit.

Dieser Kommentar geht nicht mit raus.
-->

Diese Antwort kommt von einem KI-Agenten, nicht von einem Menschen.

Danke, dass Du dabei gewesen bist. Bleib gerne mit mir in Kontakt:
<https://carstenbkoch.de/>

Die Folien zur KI-Masterclass beim ECR in Motion 2026 in Bonn:
<https://ecr2026.carstenbkoch.de/vortrag>

Der Quelltext für Präsentation, Agent und AWS-Infrastruktur — falls
Du es in Deinem Unternehmen nachbauen willst:
<https://github.com/cabcookie/ecr-in-motion-2026-talk>

Deine E-Mail-Adresse habe ich nur für diese Antwort verwendet — für
keinen Newsletter und keine Werbung. Gespeichert ist sie trotzdem:
zusammen mit Deiner Mail und dem Verlauf des Agenten in meinem
AWS-Konto. Ich lösche diese Daten nach dem Vortrag.

## Fang einfach an

Du brauchst dafür kein AWS-Konto und musst nichts bezahlen.

- [Amazon Quick](https://aws.amazon.com/quick/) — ein Agent auf Deinem Computer, der Dir bei Deinen täglichen Aufgaben hilft. Zum Anfangen reicht der kostenlose Plan; die Anmeldung braucht nur Deine E-Mail-Adresse.
- [Die App dazu](https://aws.amazon.com/quick/desktop/) — für Mac, Windows, Browser, Outlook und Excel.

## Lern mehr über KI

Beide Kurse sind kostenlos und brauchen keine Zeile Code.

- [Generative AI für Entscheider](https://skillbuilder.aws/learning-plan/STDH6NGPH7/generative-ai-learning-plan-for-decision-makers/MHMHDAWQJY) — drei Kurse, gut drei Stunden.
- [Agenten](https://skillbuilder.aws/learn/DNBD5MT8ZD/introduction-to-agentic-ai-on-aws/WAKAFK6UFY) — das Thema dieser Masterclass, in einer Stunde.

## Gib es an Deine IT weiter

Diese drei Seiten erleichtern ihr den Einstieg in AWS.

- [Amazon Bedrock](https://docs.aws.amazon.com/de_de/bedrock/latest/userguide/what-is-bedrock.html) — der Zugang zu den Modellen.
- [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) — was einen Agenten betriebsfähig macht.
- [Lernplan für Entwickler](https://explore.skillbuilder.aws/learn/public/learning_plan/view/2068/generative-ai-learning-plan-for-developers) — ebenfalls kostenlos.

## Fang nicht allein an

Der AWS-Partner tecRacer bietet zwei Einstiege an, die Preise gibt es auf Anfrage.

- [Data Readiness Discovery](https://www.tecracer.com/loesungen/conversational-generative-ai/) — nach einer Woche weißt Du, ob Deine Daten tragen.
- [GenAI Data-Evaluator](https://www.tecracer.com/en/solutions/genai-data-evaluator/) — ein Proof of Concept auf Deinen eigenen Daten.
