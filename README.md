# ECR in Motion 2026 – Talk

pnpm-Workspace für den Vortrag „ECR in Motion 2026".

## Struktur

```
packages/
  docs/           Vortragsunterlagen, Briefings, Demo-Material, Sample-Daten
  presentation/   Die Präsentation als Web-App — Live-View und Operator-View
```

## Die Präsentation

```bash
pnpm --filter @ecr-talk/presentation dev
```

| Fenster | Adresse | Zweck |
|---|---|---|
| **Live-View** | `localhost:5180` | Auf den Beamer. Feste Bühne 1920×1080, skaliert sich auf jedes Bild. |
| **Operator-View** | `localhost:5180/?operator` | Auf den zweiten Bildschirm. Vorschau der aktuellen und nächsten Folie, Sprechernotizen, Uhr, Foliensprung. |

Beide Fenster halten sich über einen `BroadcastChannel` synchron — kein Server
nötig, solange beide im selben Browser laufen. Wer klickt, ist egal: die
Navigation geht in beide Richtungen.

Steuerung in beiden Fenstern: `→` / `Leertaste` / `Bild ab` vor, `←` / `Bild auf`
zurück, `Pos1` / `Ende` an die Ränder. Bild-auf und Bild-ab bedeutet, dass
handelsübliche Presenter-Clicker funktionieren. In der Live-View schaltet `F`
auf Vollbild; in der Operator-View gibt es einen Vollbild-Knopf an der
aktuellen Folie, um eingebettete Anwendungen in Originalgröße zu bedienen.

Screenshots aller Folien: `pnpm --filter @ecr-talk/presentation shots`
(meldet auch, welche Folien zu voll für die Bühne sind).

## Storyboard

Das Storyboard-Artefakt wird aus den Foliendaten der App erzeugt — die App ist
die Quelle der Wahrheit:

```bash
pnpm --filter @ecr-talk/docs storyboard
```

## Setup

Node 24 (LTS „Krypton", siehe `.nvmrc`) und pnpm 12:

```bash
nvm use          # nimmt 24.21.0 aus .nvmrc
pnpm install
```

## Hinweis zu den Produktfotos

`packages/docs/demo/product-catalog/pictures/` (~230 MB JPEGs) ist bewusst
per `.gitignore` ausgeschlossen, damit das Repo klein bleibt. Die Bilder
liegen lokal weiter im Verzeichnis. Falls sie versioniert werden sollen,
ist Git LFS der richtige Weg.
