# ECR in Motion 2026 – Talk

pnpm-Workspace für den Vortrag „ECR in Motion 2026".

## Struktur

```
packages/
  docs/     Vortragsunterlagen, Briefings, Demo-Material, Sample-Daten
```

Weitere Packages kommen dazu, sobald wir das Material sortiert haben.

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
